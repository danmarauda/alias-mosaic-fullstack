import { v } from "convex/values";

import { internal } from "./_generated/api";
import {
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";

export const startOrchestration = mutation({
	args: {
		groupChatId: v.id("groupChats"),
		userMessage: v.string(),
		threadId: v.string(),
	},
	handler: async (ctx, args) => {
		const groupChat = await ctx.db.get(args.groupChatId);
		if (!groupChat) {
			throw new Error("Group chat not found");
		}

		await ctx.db.insert("groupChatMessages", {
			groupChatId: args.groupChatId,
			from: "user",
			content: args.userMessage,
			isSynthesized: false,
			timestamp: Date.now(),
		});

		await ctx.scheduler.runAfter(
			0,
			internal.multiAgentCoordinator.orchestrate,
			{
				groupChatId: args.groupChatId,
				userMessage: args.userMessage,
				threadId: args.threadId,
				iteration: 0,
			}
		);

		return { success: true };
	},
});

export const orchestrate = internalAction({
	args: {
		groupChatId: v.id("groupChats"),
		userMessage: v.string(),
		threadId: v.string(),
		iteration: v.number(),
	},
	handler: async (ctx, args) => {
		const groupChat = await ctx.runQuery(
			internal.multiAgentCoordinator.getGroupChat,
			{ groupChatId: args.groupChatId }
		);
		if (!groupChat) {
			return;
		}

		await ctx.runMutation(internal.multiAgentCoordinator.addMessage, {
			groupChatId: args.groupChatId,
			from: "moderator",
			content: `Analyzing request and dispatching to ${groupChat.participants.length} agents...`,
			isSynthesized: true,
		});

		for (const participant of groupChat.participants) {
			await ctx.runMutation(internal.multiAgentCoordinator.addMessage, {
				groupChatId: args.groupChatId,
				from: participant.name,
				content: `[Processing: "${args.userMessage.slice(0, 100)}..."]`,
				isSynthesized: false,
			});
		}

		const synthesis = `Synthesized response from ${groupChat.participants.length} agents for: "${args.userMessage.slice(0, 200)}"`;

		await ctx.runMutation(internal.multiAgentCoordinator.addMessage, {
			groupChatId: args.groupChatId,
			from: "moderator",
			content: synthesis,
			isSynthesized: true,
		});
	},
});

export const getGroupChat = internalQuery({
	args: { groupChatId: v.id("groupChats") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.groupChatId);
	},
});

export const addMessage = internalMutation({
	args: {
		groupChatId: v.id("groupChats"),
		from: v.string(),
		content: v.string(),
		isSynthesized: v.boolean(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("groupChatMessages", {
			groupChatId: args.groupChatId,
			from: args.from,
			content: args.content,
			isSynthesized: args.isSynthesized,
			timestamp: Date.now(),
		});
	},
});

export const getOrchestrationStatus = query({
	args: { groupChatId: v.id("groupChats") },
	handler: async (ctx, args) => {
		const messages = await ctx.db
			.query("groupChatMessages")
			.withIndex("by_group_chat", (q) => q.eq("groupChatId", args.groupChatId))
			.order("desc")
			.take(20);

		const moderatorMessages = messages.filter((m) => m.from === "moderator");
		const participantMessages = messages.filter(
			(m) => m.from !== "moderator" && m.from !== "user"
		);

		return {
			totalMessages: messages.length,
			moderatorMessages: moderatorMessages.length,
			participantResponses: participantMessages.length,
			lastActivity: messages[0]?.timestamp ?? null,
		};
	},
});
