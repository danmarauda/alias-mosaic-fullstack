import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByConversation = query({
  args: {
    conversationId: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

export const append = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.string(),
    content: v.string(),
    aiTabId: v.optional(v.string()),
    toolUse: v.optional(
      v.array(
        v.object({
          name: v.string(),
          input: v.any(),
          output: v.optional(v.string()),
          error: v.optional(v.string()),
        }),
      ),
    ),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    cacheReadTokens: v.optional(v.number()),
    cacheCreationTokens: v.optional(v.number()),
    costUsd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const last = await ctx.db
      .query("messages")
      .withIndex("by_conversation_index", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .first();

    const nextIndex = last ? last.messageIndex + 1 : 0;
    const now = Date.now();
    const id = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      toolUse: args.toolUse,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      cacheReadTokens: args.cacheReadTokens,
      cacheCreationTokens: args.cacheCreationTokens,
      costUsd: args.costUsd,
      messageIndex: nextIndex,
      aiTabId: args.aiTabId,
      createdAt: now,
    });

    await ctx.db.patch(args.conversationId, {
      firstMessage: conversation.firstMessage ?? args.content,
      messageTimestamp: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});
