import { v } from "convex/values";

import { internal } from "./_generated/api";
import {
	internalAction,
	internalMutation,
	mutation,
	query,
} from "./_generated/server";
import { chatAgent } from "./agent";

export const queueAgentRun = mutation({
	args: {
		agentId: v.id("agents"),
		prompt: v.string(),
		threadId: v.string(),
		conversationId: v.optional(v.id("conversations")),
	},
	handler: async (ctx, args) => {
		const agent = await ctx.db.get(args.agentId);
		if (!agent) {
			throw new Error("Agent not found");
		}

		const now = Date.now();
		const runId = await ctx.db.insert("agentRuns", {
			agentId: args.agentId,
			agentName: agent.name,
			agentIcon: agent.icon,
			task: args.prompt,
			model: agent.model,
			projectPath: "",
			conversationId: args.conversationId,
			status: "queued",
			processStartedAt: now,
		});

		await ctx.scheduler.runAfter(0, internal.agentExecution.executeAgent, {
			runId,
			agentId: args.agentId,
			threadId: args.threadId,
			prompt: args.prompt,
			model: agent.model,
		});

		return runId;
	},
});

export const updateRunStatus = internalMutation({
	args: {
		runId: v.id("agentRuns"),
		status: v.string(),
		response: v.optional(v.string()),
		errorMessage: v.optional(v.string()),
		inputTokens: v.optional(v.number()),
		outputTokens: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { runId, status, response, errorMessage, inputTokens, outputTokens } =
			args;

		const patch: Record<string, unknown> = { status };

		if (response !== undefined) {
			patch.response = response;
		}
		if (errorMessage !== undefined) {
			patch.errorMessage = errorMessage;
		}
		if (inputTokens !== undefined) {
			patch.inputTokens = inputTokens;
		}
		if (outputTokens !== undefined) {
			patch.outputTokens = outputTokens;
		}

		if (status === "completed" || status === "failed") {
			patch.completedAt = Date.now();
		}

		await ctx.db.patch(runId, patch);
	},
});

export const executeAgent = internalAction({
	args: {
		runId: v.id("agentRuns"),
		agentId: v.id("agents"),
		threadId: v.string(),
		prompt: v.string(),
		model: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.runMutation(internal.agentExecution.updateRunStatus, {
			runId: args.runId,
			status: "running",
		});

		try {
			await chatAgent.streamText(
				ctx,
				{ threadId: args.threadId },
				{ promptMessageId: args.prompt },
				{ saveStreamDeltas: true }
			);

			await ctx.runMutation(internal.agentExecution.updateRunStatus, {
				runId: args.runId,
				status: "completed",
			});
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";

			await ctx.runMutation(internal.agentExecution.updateRunStatus, {
				runId: args.runId,
				status: "failed",
				errorMessage,
			});
		}
	},
});

export const cancelRun = mutation({
	args: {
		runId: v.id("agentRuns"),
	},
	handler: async (ctx, args) => {
		const run = await ctx.db.get(args.runId);
		if (!run) {
			throw new Error("Agent run not found");
		}

		if (run.status !== "queued" && run.status !== "running") {
			throw new Error(
				`Cannot cancel run with status "${run.status}". Only queued or running runs can be cancelled.`
			);
		}

		await ctx.db.patch(args.runId, {
			status: "cancelled",
			completedAt: Date.now(),
		});

		return { success: true };
	},
});

export const listRecentRuns = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 50;
		return await ctx.db.query("agentRuns").order("desc").take(limit);
	},
});
