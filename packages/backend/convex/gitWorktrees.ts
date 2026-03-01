import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("gitWorktrees")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.collect();
	},
});

export const listByStatus = query({
	args: { status: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("gitWorktrees")
			.withIndex("by_status", (q) => q.eq("status", args.status))
			.collect();
	},
});

export const getById = query({
	args: { worktreeId: v.id("gitWorktrees") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.worktreeId);
	},
});

export const create = mutation({
	args: {
		path: v.string(),
		branch: v.string(),
		projectId: v.id("projects"),
		baseBranch: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert("gitWorktrees", {
			path: args.path,
			branch: args.branch,
			projectId: args.projectId,
			status: "active",
			baseBranch: args.baseBranch,
			createdAt: now,
			updatedAt: now,
		});
		return await ctx.db.get(id);
	},
});

export const updateStatus = mutation({
	args: {
		worktreeId: v.id("gitWorktrees"),
		status: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.worktreeId, {
			status: args.status,
			updatedAt: Date.now(),
		});
		return await ctx.db.get(args.worktreeId);
	},
});

export const remove = mutation({
	args: { worktreeId: v.id("gitWorktrees") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.worktreeId);
		return { success: true };
	},
});
