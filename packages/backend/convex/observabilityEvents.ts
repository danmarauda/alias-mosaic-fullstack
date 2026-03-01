import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
	args: {
		type: v.optional(v.string()),
		severity: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const take = args.limit ?? 100;

		if (args.type) {
			return await ctx.db
				.query("observabilityEvents")
				.withIndex("by_type", (q) => q.eq("type", args.type as string))
				.order("desc")
				.take(take);
		}

		if (args.severity) {
			return await ctx.db
				.query("observabilityEvents")
				.withIndex("by_severity", (q) =>
					q.eq("severity", args.severity as string)
				)
				.order("desc")
				.take(take);
		}

		return await ctx.db
			.query("observabilityEvents")
			.withIndex("by_timestamp")
			.order("desc")
			.take(take);
	},
});

export const listByAgent = query({
	args: { agentId: v.id("agents") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("observabilityEvents")
			.withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
			.collect();
	},
});

export const listByConversation = query({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("observabilityEvents")
			.withIndex("by_conversation", (q) =>
				q.eq("conversationId", args.conversationId)
			)
			.collect();
	},
});

export const getStats = query({
	args: {
		sinceTimestamp: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		let events: Doc<"observabilityEvents">[];
		if (args.sinceTimestamp) {
			events = await ctx.db
				.query("observabilityEvents")
				.withIndex("by_timestamp", (q) =>
					q.gte("timestamp", args.sinceTimestamp as number)
				)
				.collect();
		} else {
			events = await ctx.db.query("observabilityEvents").collect();
		}

		const counts: Record<string, number> = {};
		for (const event of events) {
			counts[event.type] = (counts[event.type] ?? 0) + 1;
		}
		return counts;
	},
});

export const log = mutation({
	args: {
		type: v.string(),
		severity: v.string(),
		message: v.string(),
		agentId: v.optional(v.id("agents")),
		conversationId: v.optional(v.id("conversations")),
		projectId: v.optional(v.id("projects")),
		metadata: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("observabilityEvents", {
			type: args.type,
			severity: args.severity,
			message: args.message,
			agentId: args.agentId,
			conversationId: args.conversationId,
			projectId: args.projectId,
			metadata: args.metadata,
			timestamp: Date.now(),
		});
		return await ctx.db.get(id);
	},
});

export const cleanup = mutation({
	args: { olderThan: v.number() },
	handler: async (ctx, args) => {
		let totalDeleted = 0;
		let batch = await ctx.db
			.query("observabilityEvents")
			.withIndex("by_timestamp", (q) => q.lt("timestamp", args.olderThan))
			.take(500);

		while (batch.length > 0) {
			for (const event of batch) {
				await ctx.db.delete(event._id);
			}
			totalDeleted += batch.length;

			if (batch.length < 500) {
				break;
			}

			batch = await ctx.db
				.query("observabilityEvents")
				.withIndex("by_timestamp", (q) => q.lt("timestamp", args.olderThan))
				.take(500);
		}

		return { success: true, deleted: totalDeleted };
	},
});
