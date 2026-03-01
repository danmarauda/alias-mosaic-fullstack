import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
	handler: async (ctx) => {
		return await ctx.db.query("slashCommands").collect();
	},
});

export const listByScope = query({
	args: { scope: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("slashCommands")
			.withIndex("by_scope", (q) => q.eq("scope", args.scope))
			.collect();
	},
});

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("slashCommands")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.collect();
	},
});

export const search = query({
	args: { query: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("slashCommands")
			.withSearchIndex("search_name", (q) => q.search("name", args.query))
			.collect();
	},
});

export const getById = query({
	args: { commandId: v.id("slashCommands") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.commandId);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.string(),
		handler: v.string(),
		scope: v.string(),
		projectId: v.optional(v.id("projects")),
		isBuiltIn: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("slashCommands", {
			name: args.name,
			description: args.description,
			handler: args.handler,
			scope: args.scope,
			projectId: args.projectId,
			isBuiltIn: args.isBuiltIn ?? false,
			createdAt: Date.now(),
		});
		return await ctx.db.get(id);
	},
});

export const update = mutation({
	args: {
		commandId: v.id("slashCommands"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		handler: v.optional(v.string()),
		scope: v.optional(v.string()),
		projectId: v.optional(v.id("projects")),
		isBuiltIn: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const command = await ctx.db.get(args.commandId);
		if (!command) {
			throw new Error("Slash command not found");
		}

		const { commandId, ...patch } = args;
		await ctx.db.patch(commandId, patch);
		return await ctx.db.get(commandId);
	},
});

export const remove = mutation({
	args: { commandId: v.id("slashCommands") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.commandId);
		return { success: true };
	},
});
