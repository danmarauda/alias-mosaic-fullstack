import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByConversation = query({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("checkpoints")
			.withIndex("by_conversation", (q) =>
				q.eq("conversationId", args.conversationId)
			)
			.order("desc")
			.collect();
	},
});

export const create = mutation({
	args: {
		conversationId: v.id("conversations"),
		projectId: v.id("projects"),
		messageIndex: v.number(),
		description: v.optional(v.string()),
		parentCheckpointId: v.optional(v.id("checkpoints")),
		trigger: v.string(),
		toolsUsed: v.array(v.string()),
		filesModified: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert("checkpoints", {
			conversationId: args.conversationId,
			projectId: args.projectId,
			messageIndex: args.messageIndex,
			timestamp: now,
			description: args.description,
			parentCheckpointId: args.parentCheckpointId,
			metadata: {
				trigger: args.trigger,
				toolsUsed: args.toolsUsed,
				filesModified: args.filesModified,
			},
			createdAt: now,
		});

		await ctx.db.patch(args.conversationId, {
			currentCheckpointId: id,
			updatedAt: now,
		});

		return await ctx.db.get(id);
	},
});

export const setCurrent = mutation({
	args: {
		conversationId: v.id("conversations"),
		checkpointId: v.id("checkpoints"),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.conversationId, {
			currentCheckpointId: args.checkpointId,
			updatedAt: Date.now(),
		});
		return { success: true };
	},
});
