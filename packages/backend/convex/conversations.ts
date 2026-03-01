import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const DEFAULT_TAB_ID = "tab-main";

const createDefaultTab = () => ({
	id: DEFAULT_TAB_ID,
	name: "Main",
	agentSessionId: undefined,
	isStarred: false,
	readOnlyMode: false,
	saveToHistory: true,
	unreadCount: 0,
	createdAt: Date.now(),
});

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("conversations")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.order("desc")
			.collect();
	},
});

export const getById = query({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.conversationId);
	},
});

export const create = mutation({
	args: {
		projectId: v.id("projects"),
		name: v.optional(v.string()),
		firstMessage: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const project = await ctx.db.get(args.projectId);
		if (!project) {
			throw new Error("Project not found");
		}

		const now = Date.now();
		const id = await ctx.db.insert("conversations", {
			projectId: args.projectId,
			projectPath: project.path,
			name: args.name,
			firstMessage: args.firstMessage,
			messageTimestamp: now,
			currentCheckpointId: undefined,
			autoCheckpointEnabled: false,
			checkpointStrategy: "manual",
			aiTabs: [createDefaultTab()],
			activeAITabId: DEFAULT_TAB_ID,
			filePreviewTabs: [],
			activeFileTabId: undefined,
			autoRunFolderPath: undefined,
			autoRunSelectedFile: undefined,
			autoRunMode: undefined,
			executionQueue: [],
			isProcessingQueue: false,
			createdAt: now,
			updatedAt: now,
		});
		return await ctx.db.get(id);
	},
});

export const update = mutation({
	args: {
		conversationId: v.id("conversations"),
		name: v.optional(v.string()),
		firstMessage: v.optional(v.string()),
		messageTimestamp: v.optional(v.number()),
		autoCheckpointEnabled: v.optional(v.boolean()),
		checkpointStrategy: v.optional(v.string()),
		activeAITabId: v.optional(v.string()),
		autoRunFolderPath: v.optional(v.string()),
		autoRunSelectedFile: v.optional(v.string()),
		autoRunMode: v.optional(v.string()),
		isProcessingQueue: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		const { conversationId, ...patch } = args;
		await ctx.db.patch(conversationId, {
			...patch,
			updatedAt: Date.now(),
		});
		return await ctx.db.get(conversationId);
	},
});

export const upsertThreadTab = mutation({
	args: {
		conversationId: v.id("conversations"),
		tabId: v.string(),
		tabName: v.string(),
		threadId: v.string(),
	},
	handler: async (ctx, args) => {
		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		const now = Date.now();
		const existingIndex = conversation.aiTabs.findIndex(
			(tab) => tab.id === args.tabId
		);
		const nextTabs = [...conversation.aiTabs];

		if (existingIndex >= 0) {
			const existing = nextTabs[existingIndex];
			nextTabs[existingIndex] = {
				...existing,
				name: args.tabName,
				agentSessionId: args.threadId,
			};
		} else {
			nextTabs.push({
				id: args.tabId,
				name: args.tabName,
				agentSessionId: args.threadId,
				isStarred: false,
				readOnlyMode: false,
				saveToHistory: true,
				unreadCount: 0,
				createdAt: now,
			});
		}

		await ctx.db.patch(args.conversationId, {
			aiTabs: nextTabs,
			activeAITabId: args.tabId,
			updatedAt: now,
		});
		return await ctx.db.get(args.conversationId);
	},
});

export const enqueueExecution = mutation({
	args: {
		conversationId: v.id("conversations"),
		type: v.string(),
		content: v.string(),
		readOnlyMode: v.boolean(),
	},
	handler: async (ctx, args) => {
		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation) {
			throw new Error("Conversation not found");
		}

		const nextQueue = [
			...conversation.executionQueue,
			{
				id: crypto.randomUUID(),
				type: args.type,
				content: args.content,
				readOnlyMode: args.readOnlyMode,
				queuedAt: Date.now(),
			},
		];

		await ctx.db.patch(args.conversationId, {
			executionQueue: nextQueue,
			updatedAt: Date.now(),
		});

		return { success: true, size: nextQueue.length };
	},
});

export const remove = mutation({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.conversationId);
		return { success: true };
	},
});
