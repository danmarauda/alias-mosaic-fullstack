import { v } from "convex/values";

import { internal } from "./_generated/api";
import {
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
} from "./_generated/server";

const resolveTemplate = (
	template: string,
	context: Record<string, string>
): string => {
	let resolved = template;
	for (const [key, value] of Object.entries(context)) {
		resolved = resolved.replaceAll(`{{${key}}}`, value);
	}
	resolved = resolved.replaceAll(
		"{{date}}",
		new Date().toISOString().split("T")[0]
	);
	return resolved;
};

export const execute = mutation({
	args: {
		playbookId: v.id("playbooks"),
		threadId: v.string(),
		variables: v.optional(v.record(v.string(), v.string())),
	},
	handler: async (ctx, args) => {
		const playbook = await ctx.db.get(args.playbookId);
		if (!playbook) {
			throw new Error("Playbook not found");
		}

		const runId = await ctx.db.insert("agentRuns", {
			agentId: "" as any,
			agentName: `Playbook: ${playbook.name}`,
			agentIcon: "play-circle",
			task: `Execute playbook: ${playbook.name}`,
			model: "system",
			projectPath: "",
			status: "queued",
			processStartedAt: Date.now(),
		});

		await ctx.scheduler.runAfter(0, internal.playbookExecution.executeStep, {
			playbookId: args.playbookId,
			runId,
			threadId: args.threadId,
			stepIndex: 0,
			variables: args.variables ?? {},
		});

		return runId;
	},
});

export const executeStep = internalAction({
	args: {
		playbookId: v.id("playbooks"),
		runId: v.id("agentRuns"),
		threadId: v.string(),
		stepIndex: v.number(),
		variables: v.record(v.string(), v.string()),
	},
	handler: async (ctx, args) => {
		const playbook = await ctx.runQuery(
			internal.playbookExecution.getPlaybook,
			{ playbookId: args.playbookId }
		);
		if (!playbook) {
			return;
		}

		if (args.stepIndex >= playbook.documents.length) {
			await ctx.runMutation(internal.playbookExecution.updateRunStatus, {
				runId: args.runId,
				status: "completed",
			});
			return;
		}

		await ctx.runMutation(internal.playbookExecution.updateRunStatus, {
			runId: args.runId,
			status: "running",
		});

		const step = playbook.documents[args.stepIndex];
		const prompt = resolveTemplate(playbook.customPrompt, {
			...args.variables,
			"step.path": step.path,
			"step.index": String(args.stepIndex),
			"playbook.name": playbook.name,
		});

		await ctx.runMutation(internal.playbookExecution.logStepResult, {
			playbookId: args.playbookId,
			stepIndex: args.stepIndex,
			stepPath: step.path,
			prompt,
		});

		const nextIndex = args.stepIndex + 1;
		if (nextIndex < playbook.documents.length) {
			await ctx.scheduler.runAfter(0, internal.playbookExecution.executeStep, {
				playbookId: args.playbookId,
				runId: args.runId,
				threadId: args.threadId,
				stepIndex: nextIndex,
				variables: args.variables,
			});
		} else if (playbook.enableLoop) {
			await ctx.scheduler.runAfter(0, internal.playbookExecution.executeStep, {
				playbookId: args.playbookId,
				runId: args.runId,
				threadId: args.threadId,
				stepIndex: 0,
				variables: args.variables,
			});
		} else {
			await ctx.runMutation(internal.playbookExecution.updateRunStatus, {
				runId: args.runId,
				status: "completed",
			});
		}
	},
});

export const getPlaybook = internalQuery({
	args: { playbookId: v.id("playbooks") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.playbookId);
	},
});

export const updateRunStatus = internalMutation({
	args: {
		runId: v.id("agentRuns"),
		status: v.string(),
	},
	handler: async (ctx, args) => {
		const patch: Record<string, unknown> = { status: args.status };
		if (args.status === "completed" || args.status === "failed") {
			patch.completedAt = Date.now();
		}
		await ctx.db.patch(args.runId, patch);
	},
});

export const logStepResult = internalMutation({
	args: {
		playbookId: v.id("playbooks"),
		stepIndex: v.number(),
		stepPath: v.string(),
		prompt: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("observabilityEvents", {
			type: "playbook_step",
			severity: "info",
			message: `Playbook step ${args.stepIndex}: ${args.stepPath}`,
			metadata: {
				playbookId: args.playbookId,
				stepIndex: args.stepIndex,
				prompt: args.prompt,
			},
			timestamp: Date.now(),
		});
	},
});

export const cancelExecution = mutation({
	args: { runId: v.id("agentRuns") },
	handler: async (ctx, args) => {
		const run = await ctx.db.get(args.runId);
		if (!run) {
			throw new Error("Run not found");
		}
		if (run.status !== "running" && run.status !== "queued") {
			throw new Error("Run is not active");
		}
		await ctx.db.patch(args.runId, {
			status: "cancelled",
			completedAt: Date.now(),
		});
		return { success: true };
	},
});
