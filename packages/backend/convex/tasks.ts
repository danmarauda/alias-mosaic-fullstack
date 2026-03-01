import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
	handler: async (ctx) => {
		return await ctx.db.query("tasks").order("desc").collect();
	},
});

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("tasks")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.collect();
	},
});

export const listByStatus = query({
	args: { status: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("tasks")
			.withIndex("by_status", (q) => q.eq("status", args.status))
			.collect();
	},
});

export const listByProjectAndStatus = query({
	args: {
		projectId: v.id("projects"),
		status: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("tasks")
			.withIndex("by_project_status", (q) =>
				q.eq("projectId", args.projectId).eq("status", args.status)
			)
			.collect();
	},
});

export const getById = query({
	args: { taskId: v.id("tasks") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.taskId);
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		status: v.optional(v.string()),
		priority: v.optional(v.string()),
		assignee: v.optional(v.string()),
		projectId: v.optional(v.id("projects")),
		conversationId: v.optional(v.id("conversations")),
		dueDate: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
		order: v.number(),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert("tasks", {
			title: args.title,
			description: args.description,
			status: args.status ?? "todo",
			priority: args.priority ?? "medium",
			assignee: args.assignee,
			projectId: args.projectId,
			conversationId: args.conversationId,
			dueDate: args.dueDate,
			tags: args.tags,
			order: args.order,
			createdAt: now,
			updatedAt: now,
		});
		return await ctx.db.get(id);
	},
});

export const update = mutation({
	args: {
		taskId: v.id("tasks"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		status: v.optional(v.string()),
		priority: v.optional(v.string()),
		assignee: v.optional(v.string()),
		projectId: v.optional(v.id("projects")),
		conversationId: v.optional(v.id("conversations")),
		dueDate: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
		order: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new Error("Task not found");
		}

		const { taskId, ...patch } = args;
		await ctx.db.patch(taskId, { ...patch, updatedAt: Date.now() });
		return await ctx.db.get(taskId);
	},
});

export const updateStatus = mutation({
	args: {
		taskId: v.id("tasks"),
		status: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.taskId, {
			status: args.status,
			updatedAt: Date.now(),
		});
		return await ctx.db.get(args.taskId);
	},
});

export const remove = mutation({
	args: { taskId: v.id("tasks") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.taskId);
		return { success: true };
	},
});
