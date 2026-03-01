import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("roadmapPhases")
			.withIndex("by_project_order", (q) => q.eq("projectId", args.projectId))
			.order("asc")
			.collect();
	},
});

export const getById = query({
	args: { phaseId: v.id("roadmapPhases") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.phaseId);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		status: v.optional(v.string()),
		order: v.number(),
		projectId: v.id("projects"),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert("roadmapPhases", {
			name: args.name,
			description: args.description,
			status: args.status ?? "planned",
			order: args.order,
			projectId: args.projectId,
			startDate: args.startDate,
			endDate: args.endDate,
			taskCount: 0,
			completedTaskCount: 0,
			createdAt: now,
			updatedAt: now,
		});
		return await ctx.db.get(id);
	},
});

export const update = mutation({
	args: {
		phaseId: v.id("roadmapPhases"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		status: v.optional(v.string()),
		order: v.optional(v.number()),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		taskCount: v.optional(v.number()),
		completedTaskCount: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const phase = await ctx.db.get(args.phaseId);
		if (!phase) {
			throw new Error("Roadmap phase not found");
		}

		const { phaseId, ...patch } = args;
		await ctx.db.patch(phaseId, { ...patch, updatedAt: Date.now() });
		return await ctx.db.get(phaseId);
	},
});

export const reorder = mutation({
	args: {
		phaseId: v.id("roadmapPhases"),
		newOrder: v.number(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.phaseId, {
			order: args.newOrder,
			updatedAt: Date.now(),
		});
		return await ctx.db.get(args.phaseId);
	},
});

export const remove = mutation({
	args: { phaseId: v.id("roadmapPhases") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.phaseId);
		return { success: true };
	},
});
