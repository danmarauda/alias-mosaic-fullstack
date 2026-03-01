import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const AGENT_TEMPLATES = [
	{
		id: "code-reviewer",
		name: "Code Reviewer",
		icon: "code",
		systemPrompt:
			"You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practice violations. Provide constructive feedback with specific suggestions.",
		model: "gemini-2.5-flash",
		capabilities: {
			fileRead: true,
			fileWrite: false,
			network: false,
		},
	},
	{
		id: "research-assistant",
		name: "Research Assistant",
		icon: "search",
		systemPrompt:
			"You are a thorough research assistant. Gather, synthesize, and present information clearly. Cite sources when possible and highlight key findings.",
		model: "gemini-2.5-flash",
		capabilities: {
			fileRead: true,
			fileWrite: false,
			network: true,
		},
	},
	{
		id: "task-automator",
		name: "Task Automator",
		icon: "zap",
		systemPrompt:
			"You automate repetitive development tasks. Generate boilerplate code, scaffold projects, and streamline workflows. Be efficient and follow established patterns.",
		model: "gemini-2.5-flash",
		capabilities: {
			fileRead: true,
			fileWrite: true,
			network: true,
		},
	},
	{
		id: "documentation-writer",
		name: "Documentation Writer",
		icon: "file-text",
		systemPrompt:
			"You write clear, comprehensive documentation. Create README files, API docs, inline comments, and user guides. Follow documentation best practices and maintain consistent style.",
		model: "gemini-2.5-flash",
		capabilities: {
			fileRead: true,
			fileWrite: true,
			network: false,
		},
	},
] as const;

export const listTemplates = query({
	args: {},
	handler: () => {
		return AGENT_TEMPLATES;
	},
});

export const createFromTemplate = mutation({
	args: {
		templateId: v.string(),
		name: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const template = AGENT_TEMPLATES.find((t) => t.id === args.templateId);
		if (!template) {
			throw new Error(`Template "${args.templateId}" not found`);
		}

		const now = Date.now();
		const id = await ctx.db.insert("agents", {
			name: args.name ?? template.name,
			icon: template.icon,
			systemPrompt: template.systemPrompt,
			model: template.model,
			enableFileRead: template.capabilities.fileRead,
			enableFileWrite: template.capabilities.fileWrite,
			enableNetwork: template.capabilities.network,
			createdAt: now,
			updatedAt: now,
		});

		return await ctx.db.get(id);
	},
});

export const listShared = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query("agents")
			.withIndex("by_created")
			.order("desc")
			.collect();
	},
});
