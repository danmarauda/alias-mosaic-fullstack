import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
	handler: async (ctx) => {
		return await ctx.db.query("playbooks").order("desc").collect();
	},
});

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("playbooks")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.collect();
	},
});

export const getById = query({
	args: { playbookId: v.id("playbooks") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.playbookId);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		documents: v.array(
			v.object({
				path: v.string(),
				order: v.number(),
			})
		),
		enableLoop: v.optional(v.boolean()),
		enableReset: v.optional(v.boolean()),
		worktreeEnabled: v.optional(v.boolean()),
		customPrompt: v.string(),
		projectId: v.optional(v.id("projects")),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert("playbooks", {
			name: args.name,
			description: args.description,
			documents: args.documents,
			enableLoop: args.enableLoop ?? false,
			enableReset: args.enableReset ?? false,
			worktreeEnabled: args.worktreeEnabled ?? false,
			customPrompt: args.customPrompt,
			projectId: args.projectId,
			createdAt: now,
			updatedAt: now,
		});
		return await ctx.db.get(id);
	},
});

export const update = mutation({
	args: {
		playbookId: v.id("playbooks"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		documents: v.optional(
			v.array(
				v.object({
					path: v.string(),
					order: v.number(),
				})
			)
		),
		enableLoop: v.optional(v.boolean()),
		enableReset: v.optional(v.boolean()),
		worktreeEnabled: v.optional(v.boolean()),
		customPrompt: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const playbook = await ctx.db.get(args.playbookId);
		if (!playbook) {
			throw new Error("Playbook not found");
		}

		const { playbookId, ...patch } = args;
		await ctx.db.patch(playbookId, { ...patch, updatedAt: Date.now() });
		return await ctx.db.get(playbookId);
	},
});

export const duplicate = mutation({
	args: { playbookId: v.id("playbooks") },
	handler: async (ctx, args) => {
		const playbook = await ctx.db.get(args.playbookId);
		if (!playbook) {
			throw new Error("Playbook not found");
		}

		const now = Date.now();
		const id = await ctx.db.insert("playbooks", {
			name: `${playbook.name} (Copy)`,
			description: playbook.description,
			documents: playbook.documents,
			enableLoop: playbook.enableLoop,
			enableReset: playbook.enableReset,
			worktreeEnabled: playbook.worktreeEnabled,
			customPrompt: playbook.customPrompt,
			projectId: playbook.projectId,
			createdAt: now,
			updatedAt: now,
		});
		return await ctx.db.get(id);
	},
});

export const remove = mutation({
	args: { playbookId: v.id("playbooks") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.playbookId);
		return { success: true };
	},
});
