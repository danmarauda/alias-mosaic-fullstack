import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByAgent = query({
	args: { agentId: v.id("agents") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("agentRuns")
			.withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
			.order("desc")
			.collect();
	},
});

export const listByConversation = query({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("agentRuns")
			.withIndex("by_conversation", (q) =>
				q.eq("conversationId", args.conversationId)
			)
			.order("desc")
			.collect();
	},
});

export const start = mutation({
	args: {
		agentId: v.id("agents"),
		task: v.string(),
		model: v.string(),
		projectPath: v.string(),
		conversationId: v.optional(v.id("conversations")),
		pid: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new Error("Agent not found");
		}

		const id = await ctx.db.insert("agentRuns", {
			agentId: args.agentId,
			agentName: agent.name,
			agentIcon: agent.icon,
			task: args.task,
			model: args.model,
			projectPath: args.projectPath,
			conversationId: args.conversationId,
			status: "running",
			pid: args.pid,
			processStartedAt: Date.now(),
			completedAt: undefined,
			response: undefined,
			errorMessage: undefined,
			inputTokens: undefined,
			outputTokens: undefined,
			costUsd: undefined,
		});

		return await ctx.db.get(id);
	},
});

export const finish = mutation({
	args: {
		runId: v.id("agentRuns"),
		status: v.string(),
		response: v.optional(v.string()),
		errorMessage: v.optional(v.string()),
		inputTokens: v.optional(v.number()),
		outputTokens: v.optional(v.number()),
		costUsd: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.runId, {
			status: args.status,
			response: args.response,
			errorMessage: args.errorMessage,
			inputTokens: args.inputTokens,
			outputTokens: args.outputTokens,
			costUsd: args.costUsd,
			completedAt: Date.now(),
		});
		return await ctx.db.get(args.runId);
	},
});
