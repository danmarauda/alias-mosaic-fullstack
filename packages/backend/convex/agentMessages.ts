import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";

export const sendAgentToAgent = internalMutation({
	args: {
		fromAgentRunId: v.id("agentRuns"),
		toAgentRunId: v.id("agentRuns"),
		content: v.string(),
		messageType: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("observabilityEvents", {
			type: "agent_message",
			severity: "info",
			message: args.content,
			metadata: {
				fromRunId: args.fromAgentRunId,
				toRunId: args.toAgentRunId,
				messageType: args.messageType ?? "delegation",
			},
			timestamp: Date.now(),
		});
	},
});

export const getAgentInbox = internalQuery({
	args: { agentRunId: v.id("agentRuns") },
	handler: async (ctx, args) => {
		const events = await ctx.db
			.query("observabilityEvents")
			.withIndex("by_type", (q) => q.eq("type", "agent_message"))
			.collect();

		return events.filter(
			(e) =>
				e.metadata &&
				typeof e.metadata === "object" &&
				"toRunId" in e.metadata &&
				e.metadata.toRunId === args.agentRunId
		);
	},
});

export const getAgentOutbox = internalQuery({
	args: { agentRunId: v.id("agentRuns") },
	handler: async (ctx, args) => {
		const events = await ctx.db
			.query("observabilityEvents")
			.withIndex("by_type", (q) => q.eq("type", "agent_message"))
			.collect();

		return events.filter(
			(e) =>
				e.metadata &&
				typeof e.metadata === "object" &&
				"fromRunId" in e.metadata &&
				e.metadata.fromRunId === args.agentRunId
		);
	},
});
