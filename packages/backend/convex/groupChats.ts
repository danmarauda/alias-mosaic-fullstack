import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const participantValidator = v.object({
	id: v.string(),
	name: v.string(),
	agentId: v.string(),
	systemPrompt: v.optional(v.string()),
});

// ── Group Chat CRUD ──

export const list = query({
	handler: async (ctx) => {
		return await ctx.db.query("groupChats").order("desc").collect();
	},
});

export const getById = query({
	args: { groupChatId: v.id("groupChats") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.groupChatId);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		moderatorAgentId: v.string(),
		moderatorConfig: v.optional(
			v.object({
				customPath: v.optional(v.string()),
				customModel: v.optional(v.string()),
			})
		),
		participants: v.array(participantValidator),
		isReadOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert("groupChats", {
			name: args.name,
			description: args.description,
			moderatorAgentId: args.moderatorAgentId,
			moderatorConfig: args.moderatorConfig,
			participants: args.participants,
			isReadOnly: args.isReadOnly ?? false,
			createdAt: now,
			updatedAt: now,
		});
		return await ctx.db.get(id);
	},
});

export const update = mutation({
	args: {
		groupChatId: v.id("groupChats"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		moderatorAgentId: v.optional(v.string()),
		moderatorConfig: v.optional(
			v.object({
				customPath: v.optional(v.string()),
				customModel: v.optional(v.string()),
			})
		),
		isReadOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const chat = await ctx.db.get(args.groupChatId);
		if (!chat) {
			throw new Error("Group chat not found");
		}

		const { groupChatId, ...patch } = args;
		await ctx.db.patch(groupChatId, { ...patch, updatedAt: Date.now() });
		return await ctx.db.get(groupChatId);
	},
});

export const addParticipant = mutation({
	args: {
		groupChatId: v.id("groupChats"),
		participant: participantValidator,
	},
	handler: async (ctx, args) => {
		const chat = await ctx.db.get(args.groupChatId);
		if (!chat) {
			throw new Error("Group chat not found");
		}

		await ctx.db.patch(args.groupChatId, {
			participants: [...chat.participants, args.participant],
			updatedAt: Date.now(),
		});
		return await ctx.db.get(args.groupChatId);
	},
});

export const remove = mutation({
	args: { groupChatId: v.id("groupChats") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.groupChatId);
		return { success: true };
	},
});

// ── Group Chat Messages ──

export const listMessages = query({
	args: { groupChatId: v.id("groupChats") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("groupChatMessages")
			.withIndex("by_group_chat", (q) => q.eq("groupChatId", args.groupChatId))
			.order("asc")
			.collect();
	},
});

export const sendMessage = mutation({
	args: {
		groupChatId: v.id("groupChats"),
		from: v.string(),
		content: v.string(),
		agentSessionId: v.optional(v.string()),
		isSynthesized: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("groupChatMessages", {
			groupChatId: args.groupChatId,
			from: args.from,
			content: args.content,
			agentSessionId: args.agentSessionId,
			isSynthesized: args.isSynthesized ?? false,
			timestamp: Date.now(),
		});
		return await ctx.db.get(id);
	},
});
