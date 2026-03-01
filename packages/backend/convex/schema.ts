/**
 * ALIAS-MOSAIC Unified Data Schema
 *
 * Complete data model for multi-platform AI orchestration system
 * Combines features from Claudia (Auto-claude) and Maestro
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// ============================================
	// AGENT MANAGEMENT (from Claudia)
	// ============================================
	agents: defineTable({
		// Identity
		name: v.string(),
		icon: v.string(), // lucide-icon-name

		// Agent Configuration
		systemPrompt: v.string(),
		defaultTask: v.optional(v.string()),
		model: v.string(), // claude-model-identifier

		// Permissions
		enableFileRead: v.boolean(),
		enableFileWrite: v.boolean(),
		enableNetwork: v.boolean(),

		// Hooks (JSON stringified)
		hooks: v.optional(v.string()),

		// Metadata
		createdAt: v.number(), // Unix timestamp
		updatedAt: v.number(),
	})
		.index("by_created", ["createdAt"])
		.searchIndex("search_name", { searchField: "name" }),

	agentRuns: defineTable({
		// Reference
		agentId: v.id("agents"),
		agentName: v.string(),
		agentIcon: v.string(),

		// Execution Context
		task: v.string(),
		model: v.string(),
		projectPath: v.string(),
		conversationId: v.optional(v.id("conversations")),

		// Status
		status: v.string(), // "running" | "completed" | "failed" | "cancelled"
		pid: v.optional(v.number()), // Process ID (desktop only)
		processStartedAt: v.number(),
		completedAt: v.optional(v.number()),

		// Results
		response: v.optional(v.string()),
		errorMessage: v.optional(v.string()),

		// Usage Stats
		inputTokens: v.optional(v.number()),
		outputTokens: v.optional(v.number()),
		costUsd: v.optional(v.number()),
	})
		.index("by_agent", ["agentId"])
		.index("by_conversation", ["conversationId"])
		.index("by_status", ["status"]),

	// ============================================
	// CONVERSATION MANAGEMENT (from Claudia)
	// ============================================
	conversations: defineTable({
		// Project Context
		projectId: v.id("projects"),
		projectPath: v.string(),

		// Session Info
		name: v.optional(v.string()), // User-provided name
		firstMessage: v.optional(v.string()), // For preview
		messageTimestamp: v.optional(v.number()), // Last activity

		// Timeline State
		currentCheckpointId: v.optional(v.id("checkpoints")),
		autoCheckpointEnabled: v.boolean(),
		checkpointStrategy: v.string(), // "manual" | "per_prompt" | "per_tool_use" | "smart"

		// Multi-Tab Support (from Maestro)
		aiTabs: v.array(
			v.object({
				id: v.string(),
				name: v.string(),
				agentSessionId: v.optional(v.string()),
				isStarred: v.boolean(),
				readOnlyMode: v.boolean(),
				saveToHistory: v.boolean(),
				unreadCount: v.number(),
				createdAt: v.number(),
			})
		),
		activeAITabId: v.string(),

		// File Preview Tabs (from Maestro)
		filePreviewTabs: v.array(
			v.object({
				id: v.string(),
				filePath: v.string(),
				scrollPosition: v.number(),
			})
		),
		activeFileTabId: v.optional(v.string()),

		// Auto Run State (from Maestro)
		autoRunFolderPath: v.optional(v.string()),
		autoRunSelectedFile: v.optional(v.string()),
		autoRunMode: v.optional(v.string()), // "edit" | "preview"

		// Execution Queue (from Maestro)
		executionQueue: v.array(
			v.object({
				id: v.string(),
				type: v.string(), // "user_message" | "autorun_task"
				content: v.string(),
				readOnlyMode: v.boolean(),
				queuedAt: v.number(),
			})
		),
		isProcessingQueue: v.boolean(),

		// Metadata
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_updated", ["updatedAt"])
		.searchIndex("search_firstMessage", { searchField: "firstMessage" }),

	messages: defineTable({
		// Reference
		conversationId: v.id("conversations"),

		// Message Content
		role: v.string(), // "user" | "assistant" | "system" | "tool"
		content: v.string(),

		// Tool Usage (from Claude Code)
		toolUse: v.optional(
			v.array(
				v.object({
					name: v.string(),
					input: v.any(),
					output: v.optional(v.string()),
					error: v.optional(v.string()),
				})
			)
		),

		// Usage Stats
		inputTokens: v.optional(v.number()),
		outputTokens: v.optional(v.number()),
		cacheReadTokens: v.optional(v.number()),
		cacheCreationTokens: v.optional(v.number()),
		costUsd: v.optional(v.number()),

		// Timeline
		messageIndex: v.number(), // For checkpoint referencing

		// AI Tab Association
		aiTabId: v.optional(v.string()),

		// Metadata
		createdAt: v.number(),
	})
		.index("by_conversation", ["conversationId"])
		.index("by_conversation_index", ["conversationId", "messageIndex"])
		.searchIndex("search_content", { searchField: "content" }),

	// ============================================
	// TIMELINE & CHECKPOINTS (from Claudia)
	// ============================================
	checkpoints: defineTable({
		// Reference
		conversationId: v.id("conversations"),
		projectId: v.id("projects"),

		// Checkpoint Info
		messageIndex: v.number(),
		timestamp: v.number(),
		description: v.optional(v.string()), // User-provided label

		// Timeline Tree
		parentCheckpointId: v.optional(v.id("checkpoints")),

		// Metadata
		metadata: v.optional(
			v.object({
				trigger: v.string(), // "manual" | "auto_prompt" | "auto_tool" | "smart"
				toolsUsed: v.array(v.string()),
				filesModified: v.array(v.string()),
			})
		),

		// Created At
		createdAt: v.number(),
	})
		.index("by_conversation", ["conversationId"])
		.index("by_parent", ["parentCheckpointId"]),

	fileSnapshots: defineTable({
		// Reference
		checkpointId: v.id("checkpoints"),

		// File Info
		filePath: v.string(),
		content: v.string(),
		hash: v.string(), // SHA-256 for deduplication

		// State
		isDeleted: v.boolean(),
		permissions: v.optional(v.number()),
		size: v.number(),
	})
		.index("by_checkpoint", ["checkpointId"])
		.index("by_hash", ["hash"]),

	// ============================================
	// MCP SERVER MANAGEMENT (from Claudia)
	// ============================================
	mcpServers: defineTable({
		// Identity
		name: v.string(), // Unique server identifier

		// Transport Config
		transport: v.string(), // "stdio" | "sse" | "http"
		command: v.optional(v.string()), // For stdio
		args: v.optional(v.array(v.string())),
		env: v.optional(v.record(v.string(), v.string())),
		url: v.optional(v.string()), // For sse/http

		// Scope
		scope: v.string(), // "local" | "project" | "user"
		projectId: v.optional(v.id("projects")),

		// Status
		isActive: v.boolean(),
		status: v.optional(v.string()), // "connecting" | "connected" | "error"
		lastError: v.optional(v.string()),

		// Claude Desktop Import
		importedFromClaudeDesktop: v.boolean(),

		// Metadata
		addedAt: v.number(),
		lastConnectedAt: v.optional(v.number()),
	})
		.index("by_scope", ["scope"])
		.index("by_project", ["projectId"]),

	// ============================================
	// PROJECT MANAGEMENT
	// ============================================
	projects: defineTable({
		// Identity
		name: v.string(),
		path: v.string(), // Absolute file path

		// Git Integration
		gitRepoUrl: v.optional(v.string()),
		gitBranch: v.optional(v.string()),

		// Worktree Support (from Maestro)
		worktreePath: v.optional(v.string()),
		worktreeBranch: v.optional(v.string()),
		worktreeEnabled: v.boolean(),

		// Metadata
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_path", ["path"]),

	// ============================================
	// USAGE ANALYTICS (from Claudia)
	// ============================================
	usageStats: defineTable({
		// Context
		projectId: v.id("projects"),
		conversationId: v.optional(v.id("conversations")),
		agentRunId: v.optional(v.id("agentRuns")),

		// Model Info
		model: v.string(),

		// Token Breakdown
		inputTokens: v.number(),
		outputTokens: v.number(),
		cacheReadTokens: v.number(),
		cacheCreationTokens: v.number(),
		reasoningTokens: v.optional(v.number()), // Claude extended thinking

		// Cost
		costUsd: v.number(),

		// Timestamp
		timestamp: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_conversation", ["conversationId"])
		.index("by_timestamp", ["timestamp"]),

	// ============================================
	// NOTIFICATIONS (Novu Integration)
	// ============================================
	notifications: defineTable({
		// Recipient
		userId: v.string(), // From auth

		// Content
		title: v.string(),
		body: v.string(),
		type: v.string(), // "agent_complete" | "checkpoint_created" | "mcp_connected" | etc.

		// Action
		actionUrl: v.optional(v.string()),
		actionLabel: v.optional(v.string()),

		// Status
		read: v.boolean(),
		readAt: v.optional(v.number()),

		// Novu Integration
		novuId: v.optional(v.string()), // Novu notification ID

		// Metadata
		data: v.optional(v.any()), // Additional context

		// Timestamp
		createdAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_user_read", ["userId", "read"]),

	// ============================================
	// AUTO RUN & PLAYBOOKS (from Maestro)
	// ============================================
	playbooks: defineTable({
		// Identity
		name: v.string(),
		description: v.optional(v.string()),

		// Configuration
		documents: v.array(
			v.object({
				path: v.string(), // Relative to autoRunFolderPath
				order: v.number(),
			})
		),
		enableLoop: v.boolean(),
		enableReset: v.boolean(),
		worktreeEnabled: v.boolean(),

		// Custom Prompt (with template variables)
		customPrompt: v.string(),

		// Metadata
		projectId: v.optional(v.id("projects")),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_project", ["projectId"]),

	// ============================================
	// GROUP CHAT (Multi-Agent Coordination from Maestro)
	// ============================================
	groupChats: defineTable({
		// Identity
		name: v.string(),
		description: v.optional(v.string()),

		// Configuration
		moderatorAgentId: v.string(),
		moderatorConfig: v.optional(
			v.object({
				customPath: v.optional(v.string()),
				customModel: v.optional(v.string()),
			})
		),

		// Participants
		participants: v.array(
			v.object({
				id: v.string(),
				name: v.string(),
				agentId: v.string(),
				systemPrompt: v.optional(v.string()),
			})
		),

		// State
		isReadOnly: v.boolean(),

		// Metadata
		createdAt: v.number(),
		updatedAt: v.number(),
	}),

	groupChatMessages: defineTable({
		// Reference
		groupChatId: v.id("groupChats"),

		// Message
		from: v.string(), // "user" | "moderator" | participant-name
		content: v.string(),

		// Context
		agentSessionId: v.optional(v.string()),
		isSynthesized: v.boolean(), // True for moderator summaries

		// Timestamp
		timestamp: v.number(),
	}).index("by_group_chat", ["groupChatId"]),

	// ============================================
	// ACHIEVEMENTS (Gamification from Maestro)
	// ============================================
	achievements: defineTable({
		// Reference
		userId: v.string(), // From auth

		// Achievement
		badgeLevel: v.number(), // 1-15 (Apprentice to Transcendent)
		badgeName: v.string(),
		badgeIcon: v.string(),

		// Progress
		autoRunMinutes: v.number(), // Cumulative time
		unlockedAt: v.optional(v.number()),
		acknowledged: v.boolean(), // User has seen the celebration
	})
		.index("by_user", ["userId"])
		.index("by_user_level", ["userId", "badgeLevel"]),

	// ============================================
	// TASK MANAGEMENT (Project Tasks / Kanban)
	// ============================================
	tasks: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		status: v.string(), // "backlog" | "todo" | "in_progress" | "review" | "done"
		priority: v.string(), // "low" | "medium" | "high" | "urgent"
		assignee: v.optional(v.string()), // userId or agentId
		projectId: v.optional(v.id("projects")),
		conversationId: v.optional(v.id("conversations")),
		dueDate: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
		order: v.number(), // For ordering within a column
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_status", ["status"])
		.index("by_assignee", ["assignee"])
		.index("by_project_status", ["projectId", "status"]),

	// ============================================
	// ROADMAP PHASES
	// ============================================
	roadmapPhases: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		status: v.string(), // "planned" | "in_progress" | "completed" | "blocked"
		order: v.number(),
		projectId: v.id("projects"),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		taskCount: v.optional(v.number()),
		completedTaskCount: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_project_order", ["projectId", "order"]),

	// ============================================
	// OBSERVABILITY EVENTS (Telemetry)
	// ============================================
	observabilityEvents: defineTable({
		type: v.string(), // "agent_run" | "checkpoint" | "error" | "api_call" | "user_action"
		severity: v.string(), // "debug" | "info" | "warn" | "error" | "critical"
		message: v.string(),
		agentId: v.optional(v.id("agents")),
		conversationId: v.optional(v.id("conversations")),
		projectId: v.optional(v.id("projects")),
		metadata: v.optional(v.any()),
		timestamp: v.number(),
	})
		.index("by_type", ["type"])
		.index("by_severity", ["severity"])
		.index("by_timestamp", ["timestamp"])
		.index("by_agent", ["agentId"])
		.index("by_conversation", ["conversationId"]),

	// ============================================
	// SLASH COMMANDS
	// ============================================
	slashCommands: defineTable({
		name: v.string(), // e.g., "/checkpoint"
		description: v.string(),
		handler: v.string(), // Function reference or action type
		scope: v.string(), // "global" | "project"
		projectId: v.optional(v.id("projects")),
		isBuiltIn: v.boolean(),
		createdAt: v.number(),
	})
		.index("by_scope", ["scope"])
		.index("by_project", ["projectId"])
		.searchIndex("search_name", { searchField: "name" }),

	// ============================================
	// CONDUCTOR PROFILES (AI Persona Config)
	// ============================================
	conductorProfiles: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		systemPrompt: v.string(),
		model: v.string(),
		temperature: v.optional(v.number()),
		topP: v.optional(v.number()),
		maxTokens: v.optional(v.number()),
		isDefault: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_default", ["isDefault"])
		.searchIndex("search_name", { searchField: "name" }),

	// ============================================
	// GIT WORKTREES
	// ============================================
	gitWorktrees: defineTable({
		path: v.string(),
		branch: v.string(),
		projectId: v.id("projects"),
		status: v.string(), // "active" | "stale" | "removed"
		baseBranch: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_status", ["status"]),

	// ============================================
	// BASIC TODOS (existing sample feature)
	// ============================================
	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
	}),
});
