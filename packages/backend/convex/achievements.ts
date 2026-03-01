import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByUser = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("achievements")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
	},
});

export const getByUserAndLevel = query({
	args: {
		userId: v.string(),
		badgeLevel: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("achievements")
			.withIndex("by_user_level", (q) =>
				q.eq("userId", args.userId).eq("badgeLevel", args.badgeLevel)
			)
			.first();
	},
});

export const create = mutation({
	args: {
		userId: v.string(),
		badgeLevel: v.number(),
		badgeName: v.string(),
		badgeIcon: v.string(),
		autoRunMinutes: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("achievements", {
			userId: args.userId,
			badgeLevel: args.badgeLevel,
			badgeName: args.badgeName,
			badgeIcon: args.badgeIcon,
			autoRunMinutes: args.autoRunMinutes ?? 0,
			unlockedAt: undefined,
			acknowledged: false,
		});
		return await ctx.db.get(id);
	},
});

export const unlock = mutation({
	args: { achievementId: v.id("achievements") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.achievementId, {
			unlockedAt: Date.now(),
		});
		return await ctx.db.get(args.achievementId);
	},
});

export const acknowledge = mutation({
	args: { achievementId: v.id("achievements") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.achievementId, { acknowledged: true });
		return await ctx.db.get(args.achievementId);
	},
});

export const updateProgress = mutation({
	args: {
		achievementId: v.id("achievements"),
		autoRunMinutes: v.number(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.achievementId, {
			autoRunMinutes: args.autoRunMinutes,
		});
		return await ctx.db.get(args.achievementId);
	},
});
