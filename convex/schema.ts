import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  contacts: defineTable({
    userId: v.id("users"),
    phoneNumber: v.string(), // E.164 format
    fullName: v.optional(v.string()),
    optIn: v.boolean(),
    optInTimestamp: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_user_and_phone", ["userId", "phoneNumber"]),

  campaigns: defineTable({
    userId: v.id("users"),
    name: v.string(),
    baseMessage: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("failed")
    ),
    totalContacts: v.number(),
    sentCount: v.number(),
    failedCount: v.number(),
    pendingCount: v.number(),
    scheduledAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    rateLimit: v.object({
      messagesPerMinute: v.number(),
      delayBetweenMessages: v.number(), // seconds
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  messages: defineTable({
    campaignId: v.id("campaigns"),
    contactId: v.id("contacts"),
    userId: v.id("users"),
    originalMessage: v.string(),
    variatedMessage: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("queued"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("retry")
    ),
    scheduledAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    retryCount: v.number(),
    maxRetries: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_contact", ["contactId"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledAt"]),

  sendLogs: defineTable({
    messageId: v.id("messages"),
    campaignId: v.id("campaigns"),
    contactId: v.id("contacts"),
    userId: v.id("users"),
    phoneNumber: v.string(),
    status: v.union(
      v.literal("success"),
      v.literal("failed"),
      v.literal("rate_limited"),
      v.literal("invalid_number"),
      v.literal("blocked"),
      v.literal("network_error")
    ),
    errorMessage: v.optional(v.string()),
    whatsappMessageId: v.optional(v.string()),
    timestamp: v.number(),
    retryAttempt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_campaign", ["campaignId"])
    .index("by_contact", ["contactId"])
    .index("by_status", ["status"])
    .index("by_timestamp", ["timestamp"]),

  jobQueue: defineTable({
    messageId: v.id("messages"),
    campaignId: v.id("campaigns"),
    contactId: v.id("contacts"),
    phoneNumber: v.string(),
    message: v.string(),
    priority: v.number(),
    scheduledAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    attempts: v.number(),
    maxAttempts: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_scheduled", ["scheduledAt"])
    .index("by_status", ["status"])
    .index("by_campaign", ["campaignId"]),
});