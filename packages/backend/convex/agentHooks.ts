import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

interface AgentHook {
	event: string;
	action: string;
}

function parseHooks(hooksJson: string | undefined): AgentHook[] {
	if (!hooksJson) {
		return [];
	}
	try {
		return JSON.parse(hooksJson) as AgentHook[];
	} catch {
		return [];
	}
}

export const listByAgent = query({
	args: {
		agentId: v.id("agents"),
	},
	handler: async (ctx, args) => {
		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new Error("Agent not found");
		}

		return parseHooks(agent.hooks);
	},
});

export const addHook = mutation({
	args: {
		agentId: v.id("agents"),
		event: v.string(),
		action: v.string(),
	},
	handler: async (ctx, args) => {
		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new Error("Agent not found");
		}

		const hooks = parseHooks(agent.hooks);
		hooks.push({ event: args.event, action: args.action });

		await ctx.db.patch(args.agentId, {
			hooks: JSON.stringify(hooks),
			updatedAt: Date.now(),
		});

		return hooks;
	},
});

export const removeHook = mutation({
	args: {
		agentId: v.id("agents"),
		index: v.number(),
	},
	handler: async (ctx, args) => {
		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new Error("Agent not found");
		}

		const hooks = parseHooks(agent.hooks);
		if (args.index < 0 || args.index >= hooks.length) {
			throw new Error("Hook index out of bounds");
		}

		hooks.splice(args.index, 1);

		await ctx.db.patch(args.agentId, {
			hooks: JSON.stringify(hooks),
			updatedAt: Date.now(),
		});

		return hooks;
	},
});

export const updateHook = mutation({
	args: {
		agentId: v.id("agents"),
		index: v.number(),
		event: v.optional(v.string()),
		action: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new Error("Agent not found");
		}

		const hooks = parseHooks(agent.hooks);
		if (args.index < 0 || args.index >= hooks.length) {
			throw new Error("Hook index out of bounds");
		}

		if (args.event !== undefined) {
			hooks[args.index].event = args.event;
		}
		if (args.action !== undefined) {
			hooks[args.index].action = args.action;
		}

		await ctx.db.patch(args.agentId, {
			hooks: JSON.stringify(hooks),
			updatedAt: Date.now(),
		});

		return hooks;
	},
});
