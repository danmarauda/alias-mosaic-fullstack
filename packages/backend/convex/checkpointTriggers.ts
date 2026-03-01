import { v } from "convex/values";

import { internalMutation, query } from "./_generated/server";

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("checkpoints")
			.withIndex("by_conversation")
			.collect()
			.then((checkpoints) =>
				checkpoints.filter((c) => c.projectId === args.projectId)
			);
	},
});

export const evaluateShouldCheckpoint = internalMutation({
	args: {
		conversationId: v.id("conversations"),
		projectId: v.id("projects"),
		messageCount: v.number(),
		hasToolUse: v.boolean(),
		hasError: v.boolean(),
	},
	handler: async (ctx, args) => {
		const conversation = await ctx.db.get(args.conversationId);
		if (!conversation?.autoCheckpointEnabled) {
			return { shouldCheckpoint: false };
		}

		const { checkpointStrategy } = conversation;

		if (checkpointStrategy === "per_prompt") {
			return { shouldCheckpoint: true, trigger: "auto_prompt" };
		}

		if (checkpointStrategy === "per_tool_use" && args.hasToolUse) {
			return { shouldCheckpoint: true, trigger: "auto_tool" };
		}

		if (checkpointStrategy === "smart") {
			const shouldTrigger =
				args.messageCount % 10 === 0 || args.hasError || args.hasToolUse;
			if (shouldTrigger) {
				return { shouldCheckpoint: true, trigger: "smart" };
			}
		}

		return { shouldCheckpoint: false };
	},
});

export const autoCreateCheckpoint = internalMutation({
	args: {
		conversationId: v.id("conversations"),
		projectId: v.id("projects"),
		messageIndex: v.number(),
		trigger: v.string(),
		toolsUsed: v.array(v.string()),
		filesModified: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const conversation = await ctx.db.get(args.conversationId);
		const parentCheckpointId = conversation?.currentCheckpointId;

		const now = Date.now();
		const id = await ctx.db.insert("checkpoints", {
			conversationId: args.conversationId,
			projectId: args.projectId,
			messageIndex: args.messageIndex,
			timestamp: now,
			description: `Auto checkpoint (${args.trigger})`,
			parentCheckpointId: parentCheckpointId ?? undefined,
			metadata: {
				trigger: args.trigger,
				toolsUsed: args.toolsUsed,
				filesModified: args.filesModified,
			},
			createdAt: now,
		});

		await ctx.db.patch(args.conversationId, {
			currentCheckpointId: id,
			updatedAt: now,
		});

		return id;
	},
});
