import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
	handler: async (ctx) => {
		return await ctx.db.query("conductorProfiles").order("desc").collect();
	},
});

export const getById = query({
	args: { profileId: v.id("conductorProfiles") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.profileId);
	},
});

export const getDefault = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("conductorProfiles")
			.withIndex("by_default", (q) => q.eq("isDefault", true))
			.first();
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		systemPrompt: v.string(),
		model: v.string(),
		temperature: v.optional(v.number()),
		topP: v.optional(v.number()),
		maxTokens: v.optional(v.number()),
		isDefault: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const shouldBeDefault = args.isDefault ?? false;

		if (shouldBeDefault) {
			const existing = await ctx.db
				.query("conductorProfiles")
				.withIndex("by_default", (q) => q.eq("isDefault", true))
				.first();
			if (existing) {
				await ctx.db.patch(existing._id, { isDefault: false });
			}
		}

		const now = Date.now();
		const id = await ctx.db.insert("conductorProfiles", {
			name: args.name,
			description: args.description,
			systemPrompt: args.systemPrompt,
			model: args.model,
			temperature: args.temperature,
			topP: args.topP,
			maxTokens: args.maxTokens,
			isDefault: shouldBeDefault,
			createdAt: now,
			updatedAt: now,
		});
		return await ctx.db.get(id);
	},
});

export const update = mutation({
	args: {
		profileId: v.id("conductorProfiles"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		systemPrompt: v.optional(v.string()),
		model: v.optional(v.string()),
		temperature: v.optional(v.number()),
		topP: v.optional(v.number()),
		maxTokens: v.optional(v.number()),
		isDefault: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const profile = await ctx.db.get(args.profileId);
		if (!profile) {
			throw new Error("Conductor profile not found");
		}

		if (args.isDefault === true) {
			const existing = await ctx.db
				.query("conductorProfiles")
				.withIndex("by_default", (q) => q.eq("isDefault", true))
				.first();
			if (existing && existing._id !== args.profileId) {
				await ctx.db.patch(existing._id, { isDefault: false });
			}
		}

		const { profileId, ...patch } = args;
		await ctx.db.patch(profileId, { ...patch, updatedAt: Date.now() });
		return await ctx.db.get(profileId);
	},
});

export const setDefault = mutation({
	args: { profileId: v.id("conductorProfiles") },
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("conductorProfiles")
			.withIndex("by_default", (q) => q.eq("isDefault", true))
			.first();
		if (existing) {
			await ctx.db.patch(existing._id, { isDefault: false });
		}

		await ctx.db.patch(args.profileId, {
			isDefault: true,
			updatedAt: Date.now(),
		});
		return await ctx.db.get(args.profileId);
	},
});

export const remove = mutation({
	args: { profileId: v.id("conductorProfiles") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.profileId);
		return { success: true };
	},
});
