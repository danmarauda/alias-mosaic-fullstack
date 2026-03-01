import { google } from "@ai-sdk/google";
import { Agent } from "@convex-dev/agent";

import { components } from "./_generated/api";

type LanguageModel = ReturnType<typeof google>;

export function resolveModel(modelString: string): LanguageModel {
	if (modelString.startsWith("gemini-")) {
		return google(modelString as Parameters<typeof google>[0]);
	}
	return google("gemini-2.5-flash");
}

export const chatAgent = new Agent(components.agent, {
	name: "Chat Agent",
	languageModel: google("gemini-2.5-flash"),
	instructions:
		"You are a helpful AI assistant. Be concise and friendly in your responses.",
});

export const codeAgent = new Agent(components.agent, {
	name: "Code Agent",
	languageModel: google("gemini-2.5-flash"),
	instructions:
		"You are an expert software engineer. Help with code review, debugging, and implementation. Be precise and provide code examples.",
});

export const researchAgent = new Agent(components.agent, {
	name: "Research Agent",
	languageModel: google("gemini-2.5-flash"),
	instructions:
		"You are a research assistant. Analyze information thoroughly, cite sources when possible, and provide balanced perspectives.",
});
