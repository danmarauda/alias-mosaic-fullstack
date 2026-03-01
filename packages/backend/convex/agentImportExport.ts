import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const exportAgent = query({
	args: { agentId: v.id("agents") },
	handler: async (ctx, args) => {
		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new Error("Agent not found");
		}

		const { _id, _creationTime, ...config } = agent;
		return JSON.stringify(config, null, 2);
	},
});

export const importAgent = mutation({
	args: {
		configJson: v.string(),
	},
	handler: async (ctx, args) => {
		let config: Record<string, unknown>;
		try {
			config = JSON.parse(args.configJson);
		} catch {
			throw new Error("Invalid JSON format");
		}

		if (
			typeof config.name !== "string" ||
			typeof config.systemPrompt !== "string"
		) {
			throw new Error("Agent config must include name and systemPrompt");
		}

		const now = Date.now();
		const id = await ctx.db.insert("agents", {
			name: config.name as string,
			icon: (config.icon as string) ?? "bot",
			systemPrompt: config.systemPrompt as string,
			defaultTask: config.defaultTask as string | undefined,
			model: (config.model as string) ?? "gemini-2.5-flash",
			enableFileRead: (config.enableFileRead as boolean) ?? false,
			enableFileWrite: (config.enableFileWrite as boolean) ?? false,
			enableNetwork: (config.enableNetwork as boolean) ?? false,
			hooks: config.hooks as string | undefined,
			createdAt: now,
			updatedAt: now,
		});

		return await ctx.db.get(id);
	},
});

export const exportAllAgents = query({
	args: {},
	handler: async (ctx) => {
		const agents = await ctx.db.query("agents").collect();
		const configs = agents.map((agent) => {
			const { _id, _creationTime, ...config } = agent;
			return config;
		});
		return JSON.stringify(configs, null, 2);
	},
});

export const importManyAgents = mutation({
	args: {
		configsJson: v.string(),
	},
	handler: async (ctx, args) => {
		let configs: Record<string, unknown>[];
		try {
			configs = JSON.parse(args.configsJson);
		} catch {
			throw new Error("Invalid JSON format");
		}

		if (!Array.isArray(configs)) {
			throw new Error("Expected an array of agent configs");
		}

		const now = Date.now();
		const ids: string[] = [];

		for (const config of configs) {
			if (
				typeof config.name !== "string" ||
				typeof config.systemPrompt !== "string"
			) {
				continue;
			}

			const id = await ctx.db.insert("agents", {
				name: config.name as string,
				icon: (config.icon as string) ?? "bot",
				systemPrompt: config.systemPrompt as string,
				defaultTask: config.defaultTask as string | undefined,
				model: (config.model as string) ?? "gemini-2.5-flash",
				enableFileRead: (config.enableFileRead as boolean) ?? false,
				enableFileWrite: (config.enableFileWrite as boolean) ?? false,
				enableNetwork: (config.enableNetwork as boolean) ?? false,
				hooks: config.hooks as string | undefined,
				createdAt: now,
				updatedAt: now,
			});
			ids.push(id);
		}

		return { success: true, imported: ids.length };
	},
});
