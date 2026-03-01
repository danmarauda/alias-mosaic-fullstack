import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const forkConversation = mutation({
	args: {
		conversationId: v.id("conversations"),
		atMessageIndex: v.number(),
		newName: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const original = await ctx.db.get(args.conversationId);
		if (!original) {
			throw new Error("Conversation not found");
		}

		const messages = await ctx.db
			.query("messages")
			.withIndex("by_conversation_index", (q) =>
				q.eq("conversationId", args.conversationId)
			)
			.collect();

		const messagesToCopy = messages.filter(
			(m) => m.messageIndex <= args.atMessageIndex
		);

		const now = Date.now();
		const forkId = await ctx.db.insert("conversations", {
			projectId: original.projectId,
			projectPath: original.projectPath,
			name: args.newName ?? `Fork of ${original.name ?? "conversation"}`,
			firstMessage: original.firstMessage,
			messageTimestamp: now,
			currentCheckpointId: undefined,
			autoCheckpointEnabled: original.autoCheckpointEnabled,
			checkpointStrategy: original.checkpointStrategy,
			aiTabs: [
				{
					id: "tab-main",
					name: "Main",
					agentSessionId: undefined,
					isStarred: false,
					readOnlyMode: false,
					saveToHistory: true,
					unreadCount: 0,
					createdAt: now,
				},
			],
			activeAITabId: "tab-main",
			filePreviewTabs: [],
			activeFileTabId: undefined,
			autoRunFolderPath: original.autoRunFolderPath,
			autoRunSelectedFile: original.autoRunSelectedFile,
			autoRunMode: original.autoRunMode,
			executionQueue: [],
			isProcessingQueue: false,
			createdAt: now,
			updatedAt: now,
		});

		for (const msg of messagesToCopy) {
			await ctx.db.insert("messages", {
				conversationId: forkId,
				role: msg.role,
				content: msg.content,
				toolUse: msg.toolUse,
				inputTokens: msg.inputTokens,
				outputTokens: msg.outputTokens,
				cacheReadTokens: msg.cacheReadTokens,
				cacheCreationTokens: msg.cacheCreationTokens,
				costUsd: msg.costUsd,
				messageIndex: msg.messageIndex,
				aiTabId: msg.aiTabId,
				createdAt: msg.createdAt,
			});
		}

		return await ctx.db.get(forkId);
	},
});

export const listForks = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("conversations")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.order("desc")
			.collect();
	},
});
