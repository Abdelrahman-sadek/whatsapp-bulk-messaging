import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

export const getNextJobs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const jobs = await ctx.db
      .query("jobQueue")
      .withIndex("by_scheduled", (q) => q.lte("scheduledAt", now))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("asc")
      .take(args.limit || 10);

    return jobs;
  },
});

export const markJobProcessing = mutation({
  args: {
    jobId: v.id("jobQueue"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.jobId, {
      status: "processing",
      updatedAt: now,
    });

    return { success: true };
  },
});

export const markJobCompleted = mutation({
  args: {
    jobId: v.id("jobQueue"),
    whatsappMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Update job status
    await ctx.db.patch(args.jobId, {
      status: "completed",
      updatedAt: now,
    });

    // Update message status
    await ctx.db.patch(job.messageId, {
      status: "sent",
      sentAt: now,
      updatedAt: now,
    });

    // Create send log
    await ctx.db.insert("sendLogs", {
      messageId: job.messageId,
      campaignId: job.campaignId,
      contactId: job.contactId,
      userId: (await ctx.db.get(job.campaignId))!.userId,
      phoneNumber: job.phoneNumber,
      status: "success",
      whatsappMessageId: args.whatsappMessageId,
      timestamp: now,
      retryAttempt: job.attempts,
    });

    // Update campaign counters
    const campaign = await ctx.db.get(job.campaignId);
    if (campaign) {
      await ctx.db.patch(job.campaignId, {
        sentCount: campaign.sentCount + 1,
        pendingCount: Math.max(0, campaign.pendingCount - 1),
        updatedAt: now,
      });

      // Check if campaign is complete
      if (campaign.sentCount + 1 >= campaign.totalContacts) {
        await ctx.db.patch(job.campaignId, {
          status: "completed",
          completedAt: now,
        });
      }
    }

    return { success: true };
  },
});

export const markJobFailed = mutation({
  args: {
    jobId: v.id("jobQueue"),
    errorMessage: v.string(),
    shouldRetry: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const newAttempts = job.attempts + 1;
    const shouldRetry = args.shouldRetry && newAttempts < job.maxAttempts;

    if (shouldRetry) {
      // Schedule retry with exponential backoff
      const retryDelay = Math.pow(2, newAttempts) * 60 * 1000; // 2^n minutes
      const retryAt = now + retryDelay;

      await ctx.db.patch(args.jobId, {
        status: "pending",
        attempts: newAttempts,
        scheduledAt: retryAt,
        updatedAt: now,
      });

      await ctx.db.patch(job.messageId, {
        status: "retry",
        retryCount: newAttempts,
        updatedAt: now,
      });
    } else {
      // Mark as permanently failed
      await ctx.db.patch(args.jobId, {
        status: "failed",
        attempts: newAttempts,
        updatedAt: now,
      });

      await ctx.db.patch(job.messageId, {
        status: "failed",
        failedAt: now,
        retryCount: newAttempts,
        updatedAt: now,
      });

      // Update campaign counters
      const campaign = await ctx.db.get(job.campaignId);
      if (campaign) {
        await ctx.db.patch(job.campaignId, {
          failedCount: campaign.failedCount + 1,
          pendingCount: Math.max(0, campaign.pendingCount - 1),
          updatedAt: now,
        });
      }
    }

    // Create send log
    await ctx.db.insert("sendLogs", {
      messageId: job.messageId,
      campaignId: job.campaignId,
      contactId: job.contactId,
      userId: (await ctx.db.get(job.campaignId))!.userId,
      phoneNumber: job.phoneNumber,
      status: "failed",
      errorMessage: args.errorMessage,
      timestamp: now,
      retryAttempt: job.attempts,
    });

    return { success: true, willRetry: shouldRetry };
  },
});

export const getQueueStats = query({
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("jobQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const processing = await ctx.db
      .query("jobQueue")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .collect();

    const completed = await ctx.db
      .query("jobQueue")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();

    const failed = await ctx.db
      .query("jobQueue")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();

    return {
      pending: pending.length,
      processing: processing.length,
      completed: completed.length,
      failed: failed.length,
      total: pending.length + processing.length + completed.length + failed.length,
    };
  },
});