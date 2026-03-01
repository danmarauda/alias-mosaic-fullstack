import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("usageStats")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.order("desc")
			.collect();
	},
});

export const listByConversation = query({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("usageStats")
			.withIndex("by_conversation", (q) =>
				q.eq("conversationId", args.conversationId)
			)
			.collect();
	},
});

export const getByTimeRange = query({
	args: {
		startTime: v.number(),
		endTime: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("usageStats")
			.withIndex("by_timestamp", (q) =>
				q.gte("timestamp", args.startTime).lte("timestamp", args.endTime)
			)
			.collect();
	},
});

export const record = mutation({
	args: {
		projectId: v.id("projects"),
		conversationId: v.optional(v.id("conversations")),
		agentRunId: v.optional(v.id("agentRuns")),
		model: v.string(),
		inputTokens: v.number(),
		outputTokens: v.number(),
		cacheReadTokens: v.number(),
		cacheCreationTokens: v.number(),
		reasoningTokens: v.optional(v.number()),
		costUsd: v.number(),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("usageStats", {
			...args,
			timestamp: Date.now(),
		});
		return await ctx.db.get(id);
	},
});

export const getTotalByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const stats = await ctx.db
			.query("usageStats")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.collect();

		let totalInputTokens = 0;
		let totalOutputTokens = 0;
		let totalCostUsd = 0;

		for (const stat of stats) {
			totalInputTokens += stat.inputTokens;
			totalOutputTokens += stat.outputTokens;
			totalCostUsd += stat.costUsd;
		}

		return { totalInputTokens, totalOutputTokens, totalCostUsd };
	},
});
