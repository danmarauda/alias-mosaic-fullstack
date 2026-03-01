import { v } from "convex/values";

import { query } from "./_generated/server";

export const searchConversations = query({
	args: { searchQuery: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("conversations")
			.withSearchIndex("search_firstMessage", (q) =>
				q.search("firstMessage", args.searchQuery)
			)
			.collect();
	},
});

export const searchMessages = query({
	args: {
		searchQuery: v.string(),
		conversationId: v.optional(v.id("conversations")),
	},
	handler: async (ctx, args) => {
		const results = await ctx.db
			.query("messages")
			.withSearchIndex("search_content", (q) => {
				const base = q.search("content", args.searchQuery);
				return base;
			})
			.take(50);

		if (args.conversationId) {
			return results.filter(
				(msg) => msg.conversationId === args.conversationId
			);
		}

		return results;
	},
});
