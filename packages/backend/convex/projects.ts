import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
	handler: async (ctx) => {
		return await ctx.db.query("projects").order("desc").collect();
	},
});

export const getById = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.projectId);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		path: v.string(),
		gitRepoUrl: v.optional(v.string()),
		gitBranch: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const existing = await ctx.db
			.query("projects")
			.withIndex("by_path", (q) => q.eq("path", args.path))
			.first();

		if (existing) {
			return existing;
		}

		const id = await ctx.db.insert("projects", {
			name: args.name,
			path: args.path,
			gitRepoUrl: args.gitRepoUrl,
			gitBranch: args.gitBranch,
			worktreePath: undefined,
			worktreeBranch: undefined,
			worktreeEnabled: false,
			createdAt: now,
			updatedAt: now,
		});

		return await ctx.db.get(id);
	},
});

export const update = mutation({
	args: {
		projectId: v.id("projects"),
		name: v.optional(v.string()),
		path: v.optional(v.string()),
		gitRepoUrl: v.optional(v.string()),
		gitBranch: v.optional(v.string()),
		worktreePath: v.optional(v.string()),
		worktreeBranch: v.optional(v.string()),
		worktreeEnabled: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const project = await ctx.db.get(args.projectId);
		if (!project) {
			throw new Error("Project not found");
		}

		const { projectId, ...patch } = args;
		await ctx.db.patch(projectId, { ...patch, updatedAt: Date.now() });
		return await ctx.db.get(projectId);
	},
});

export const remove = mutation({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.projectId);
		return { success: true };
	},
});
