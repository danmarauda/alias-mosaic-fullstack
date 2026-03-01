import { v } from "convex/values";

import { query } from "./_generated/server";

export const exportConversationCSV = query({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		const messages = await ctx.db
			.query("messages")
			.withIndex("by_conversation", (q) =>
				q.eq("conversationId", args.conversationId)
			)
			.order("asc")
			.collect();

		const header =
			"index,role,content,tokens_in,tokens_out,cost_usd,created_at";
		const rows = messages.map((msg) => {
			const content = msg.content.replace(/"/g, '""').replace(/\n/g, "\\n");
			return `${msg.messageIndex},"${msg.role}","${content}",${msg.inputTokens ?? 0},${msg.outputTokens ?? 0},${msg.costUsd ?? 0},${new Date(msg.createdAt).toISOString()}`;
		});

		return [header, ...rows].join("\n");
	},
});

export const exportAnalyticsCSV = query({
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

		const header =
			"model,input_tokens,output_tokens,cache_read,cache_creation,cost_usd,timestamp";
		const rows = stats.map(
			(s) =>
				`"${s.model}",${s.inputTokens},${s.outputTokens},${s.cacheReadTokens},${s.cacheCreationTokens},${s.costUsd},${new Date(s.timestamp).toISOString()}`
		);

		return [header, ...rows].join("\n");
	},
});

export const exportAgentsJSON = query({
	args: {},
	handler: async (ctx) => {
		const agents = await ctx.db.query("agents").collect();
		const exported = agents.map((agent) => {
			const { _id, _creationTime, ...config } = agent;
			return config;
		});
		return JSON.stringify(exported, null, 2);
	},
});
