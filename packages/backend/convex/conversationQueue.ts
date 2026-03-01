import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";

export const enqueueMessage = mutation({
	args: {
		conversationId: v.id("conversations"),
		type: v.string(),
		content: v.string(),
		readOnlyMode: v.boolean(),
		priority: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		const item = {
			id: crypto.randomUUID(),
			type: args.type,
			content: args.content,
			readOnlyMode: args.readOnlyMode,
			queuedAt: Date.now(),
		};

		const nextQueue = [...conversation.executionQueue, item];
		await ctx.db.patch(args.conversationId, {
			executionQueue: nextQueue,
			updatedAt: Date.now(),
		});

		return { success: true, queueId: item.id, size: nextQueue.length };
	},
});

export const dequeueNext = internalMutation({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation || conversation.executionQueue.length === 0) {
			return null;
		}

		const [next, ...remaining] = conversation.executionQueue;
		await ctx.db.patch(args.conversationId, {
			executionQueue: remaining,
			isProcessingQueue: true,
			updatedAt: Date.now(),
		});

		return next;
	},
});

export const markProcessingComplete = internalMutation({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation) {
			return;
		}

		await ctx.db.patch(args.conversationId, {
			isProcessingQueue: conversation.executionQueue.length > 0,
			updatedAt: Date.now(),
		});
	},
});

export const getQueueStatus = query({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		return {
			pending: conversation.executionQueue.length,
			isProcessing: conversation.isProcessingQueue,
		};
	},
});

export const clearQueue = mutation({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.conversationId, {
			executionQueue: [],
			isProcessingQueue: false,
			updatedAt: Date.now(),
		});
		return { success: true };
	},
});
