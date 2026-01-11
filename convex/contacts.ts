import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Validate E.164 phone number format
function validateE164(phoneNumber: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

// Normalize phone number to E.164 format
function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let normalized = phoneNumber.replace(/[^\d+]/g, "");
  
  // If it doesn't start with +, add it
  if (!normalized.startsWith("+")) {
    normalized = "+" + normalized;
  }
  
  return normalized;
}

export const uploadContacts = mutation({
  args: {
    userId: v.id("users"),
    contacts: v.array(
      v.object({
        phoneNumber: v.string(),
        fullName: v.optional(v.string()),
        optIn: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = {
      successful: 0,
      failed: 0,
      duplicates: 0,
      errors: [] as string[],
    };

    for (const contact of args.contacts) {
      try {
        // Normalize and validate phone number
        const normalizedPhone = normalizePhoneNumber(contact.phoneNumber);
        
        if (!validateE164(normalizedPhone)) {
          results.failed++;
          results.errors.push(`Invalid phone number format: ${contact.phoneNumber}`);
          continue;
        }

        // Check if opt-in is true
        if (!contact.optIn) {
          results.failed++;
          results.errors.push(`Contact ${normalizedPhone} has not opted in`);
          continue;
        }

        // Check for existing contact
        const existing = await ctx.db
          .query("contacts")
          .withIndex("by_user_and_phone", (q) =>
            q.eq("userId", args.userId).eq("phoneNumber", normalizedPhone)
          )
          .first();

        if (existing) {
          // Update existing contact
          await ctx.db.patch(existing._id, {
            fullName: contact.fullName,
            optIn: contact.optIn,
            optInTimestamp: contact.optIn ? now : existing.optInTimestamp,
            updatedAt: now,
          });
          results.duplicates++;
        } else {
          // Create new contact
          await ctx.db.insert("contacts", {
            userId: args.userId,
            phoneNumber: normalizedPhone,
            fullName: contact.fullName,
            optIn: contact.optIn,
            optInTimestamp: contact.optIn ? now : undefined,
            createdAt: now,
            updatedAt: now,
          });
          results.successful++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error processing ${contact.phoneNumber}: ${error}`);
      }
    }

    return results;
  },
});

export const getContacts = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate({
        numItems: args.limit || 50,
        cursor: null,
      });

    return contacts;
  },
});

export const getContactsWithOptIn = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("optIn"), true))
      .collect();

    return contacts;
  },
});

export const updateContactOptIn = mutation({
  args: {
    contactId: v.id("contacts"),
    optIn: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.contactId, {
      optIn: args.optIn,
      optInTimestamp: args.optIn ? now : undefined,
      updatedAt: now,
    });

    return { success: true };
  },
});