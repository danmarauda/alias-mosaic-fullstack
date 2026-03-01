import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByUser = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("notifications")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.order("desc")
			.collect();
	},
});

export const listUnread = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("notifications")
			.withIndex("by_user_read", (q) =>
				q.eq("userId", args.userId).eq("read", false)
			)
			.order("desc")
			.collect();
	},
});

export const create = mutation({
	args: {
		userId: v.string(),
		title: v.string(),
		body: v.string(),
		type: v.string(),
		actionUrl: v.optional(v.string()),
		actionLabel: v.optional(v.string()),
		data: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("notifications", {
			userId: args.userId,
			title: args.title,
			body: args.body,
			type: args.type,
			actionUrl: args.actionUrl,
			actionLabel: args.actionLabel,
			read: false,
			readAt: undefined,
			novuId: undefined,
			data: args.data,
			createdAt: Date.now(),
		});
		return await ctx.db.get(id);
	},
});

export const markRead = mutation({
	args: { notificationId: v.id("notifications") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.notificationId, {
			read: true,
			readAt: Date.now(),
		});
		return await ctx.db.get(args.notificationId);
	},
});

export const markAllRead = mutation({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const unread = await ctx.db
			.query("notifications")
			.withIndex("by_user_read", (q) =>
				q.eq("userId", args.userId).eq("read", false)
			)
			.collect();

		const now = Date.now();
		for (const notification of unread) {
			await ctx.db.patch(notification._id, { read: true, readAt: now });
		}

		return { success: true, count: unread.length };
	},
});

export const remove = mutation({
	args: { notificationId: v.id("notifications") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.notificationId);
		return { success: true };
	},
});
