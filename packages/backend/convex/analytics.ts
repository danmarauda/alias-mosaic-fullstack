import { v } from "convex/values";

import { internalMutation, query } from "./_generated/server";

export const getDailyStats = query({
	args: {
		startDate: v.number(),
		endDate: v.number(),
	},
	handler: async (ctx, args) => {
		const stats = await ctx.db
			.query("usageStats")
			.withIndex("by_timestamp", (q) =>
				q.gte("timestamp", args.startDate).lte("timestamp", args.endDate)
			)
			.collect();

		const dailyMap = new Map<
			string,
			{ messages: number; tokens: number; cost: number; agentRuns: number }
		>();

		for (const stat of stats) {
			const dayKey = new Date(stat.timestamp).toISOString().split("T")[0];
			const existing = dailyMap.get(dayKey) ?? {
				messages: 0,
				tokens: 0,
				cost: 0,
				agentRuns: 0,
			};
			existing.messages += 1;
			existing.tokens += stat.inputTokens + stat.outputTokens;
			existing.cost += stat.costUsd;
			dailyMap.set(dayKey, existing);
		}

		return Array.from(dailyMap.entries()).map(([date, data]) => ({
			date,
			...data,
		}));
	},
});

export const getAgentAnalytics = query({
	args: { agentId: v.id("agents") },
	handler: async (ctx, args) => {
		const runs = await ctx.db
			.query("agentRuns")
			.withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
			.collect();

		let totalRuns = 0;
		let completedRuns = 0;
		let failedRuns = 0;
		let totalInputTokens = 0;
		let totalOutputTokens = 0;
		let totalCost = 0;

		for (const run of runs) {
			totalRuns++;
			if (run.status === "completed") {
				completedRuns++;
			}
			if (run.status === "failed") {
				failedRuns++;
			}
			totalInputTokens += run.inputTokens ?? 0;
			totalOutputTokens += run.outputTokens ?? 0;
			totalCost += run.costUsd ?? 0;
		}

		return {
			totalRuns,
			completedRuns,
			failedRuns,
			successRate: totalRuns > 0 ? completedRuns / totalRuns : 0,
			totalInputTokens,
			totalOutputTokens,
			totalCost,
		};
	},
});

export const getOverview = query({
	args: {},
	handler: async (ctx) => {
		const agents = await ctx.db.query("agents").collect();
		const conversations = await ctx.db.query("conversations").collect();
		const checkpoints = await ctx.db.query("checkpoints").collect();
		const agentRuns = await ctx.db.query("agentRuns").collect();

		const now = Date.now();
		const oneDayAgo = now - 86_400_000;

		const recentRuns = agentRuns.filter((r) => r.processStartedAt > oneDayAgo);
		const activeConversations = conversations.filter(
			(c) => c.updatedAt > oneDayAgo
		);

		return {
			totalAgents: agents.length,
			totalConversations: conversations.length,
			totalCheckpoints: checkpoints.length,
			totalAgentRuns: agentRuns.length,
			runsToday: recentRuns.length,
			activeConversationsToday: activeConversations.length,
		};
	},
});

export const aggregateDaily = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const oneDayAgo = now - 86_400_000;

		const events = await ctx.db
			.query("observabilityEvents")
			.withIndex("by_timestamp", (q) => q.gte("timestamp", oneDayAgo))
			.collect();

		const counts: Record<string, number> = {};
		for (const event of events) {
			counts[event.type] = (counts[event.type] ?? 0) + 1;
		}

		return { period: "daily", timestamp: now, counts };
	},
});
