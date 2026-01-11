import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Generate message variations to avoid repetition
function generateMessageVariations(baseMessage: string, contactName?: string): string[] {
  const variations = [];
  
  // Replace variables
  let message = baseMessage.replace(/\{\{name\}\}/g, contactName || "there");
  
  // Add name prefix if contact name exists
  if (contactName) {
    message = `Hi ${contactName}, ${message}`;
  }
  
  // Generate semantic variations
  const greetings = ["Hi", "Hello", "Hey"];
  const connectors = [", ", " - ", ". "];
  
  if (contactName) {
    for (const greeting of greetings) {
      for (const connector of connectors) {
        const variation = `${greeting} ${contactName}${connector}${baseMessage.replace(/\{\{name\}\}/g, contactName)}`;
        variations.push(variation);
      }
    }
  } else {
    variations.push(message);
  }
  
  return variations;
}

export const createCampaign = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    baseMessage: v.string(),
    rateLimit: v.object({
      messagesPerMinute: v.number(),
      delayBetweenMessages: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get opted-in contacts count
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("optIn"), true))
      .collect();

    const campaignId = await ctx.db.insert("campaigns", {
      userId: args.userId,
      name: args.name,
      baseMessage: args.baseMessage,
      status: "draft",
      totalContacts: contacts.length,
      sentCount: 0,
      failedCount: 0,
      pendingCount: contacts.length,
      rateLimit: args.rateLimit,
      createdAt: now,
      updatedAt: now,
    });

    // Create message records for each contact
    let scheduledTime = now;
    const delayMs = args.rateLimit.delayBetweenMessages * 1000;

    for (const contact of contacts) {
      const variations = generateMessageVariations(args.baseMessage, contact.fullName);
      const selectedVariation = variations[Math.floor(Math.random() * variations.length)];

      await ctx.db.insert("messages", {
        campaignId,
        contactId: contact._id,
        userId: args.userId,
        originalMessage: args.baseMessage,
        variatedMessage: selectedVariation,
        status: "pending",
        scheduledAt: scheduledTime,
        retryCount: 0,
        maxRetries: 3,
        createdAt: now,
        updatedAt: now,
      });

      scheduledTime += delayMs;
    }

    return { campaignId, totalContacts: contacts.length };
  },
});

export const startCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status !== "draft" && campaign.status !== "paused") {
      throw new Error("Campaign cannot be started from current status");
    }

    const now = Date.now();
    
    await ctx.db.patch(args.campaignId, {
      status: "running",
      startedAt: now,
      updatedAt: now,
    });

    // Queue pending messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    for (const message of messages) {
      const contact = await ctx.db.get(message.contactId);
      if (!contact) continue;

      await ctx.db.insert("jobQueue", {
        messageId: message._id,
        campaignId: args.campaignId,
        contactId: message.contactId,
        phoneNumber: contact.phoneNumber,
        message: message.variatedMessage,
        priority: 1,
        scheduledAt: message.scheduledAt || now,
        status: "pending",
        attempts: 0,
        maxAttempts: 3,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.patch(message._id, {
        status: "queued",
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const pauseCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.campaignId, {
      status: "paused",
      updatedAt: now,
    });

    return { success: true };
  },
});

export const getCampaigns = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return campaigns;
  },
});

export const getCampaignDetails = query({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const recentLogs = await ctx.db
      .query("sendLogs")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .take(50);

    return {
      campaign,
      messages,
      recentLogs,
    };
  },
});