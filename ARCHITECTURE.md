# ALIAS-MOSAIC Architecture

**The Meta-Orchestration System for AI Collaboration**

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Data Models](#data-models)
5. [API Reference](#api-reference)
6. [Platform-Specific Implementation](#platform-specific-implementation)
7. [Real-Time Updates](#real-time-updates)
8. [Notification System](#notification-system)
9. [Reference Repos & Feature Sources](#reference-repos--feature-sources)
10. [Development Phases](#development-phases)
11. [New Schema Additions](#new-schema-additions)
12. [Migration Strategy](#migration-strategy)

---

## Overview

ALIAS-MOSAIC is a unified multi-platform AI orchestration system combining the best features from three reference applications:

- **Claudia** (v latest, `feature/multi-agent-observability`): Desktop GUI for Claude Code — custom agents, MCP management, timeline/checkpoints, **multi-agent observability dashboard** with Warp HTTP + WebSocket event streaming
- **Maestro** (v0.15.0): Workflow automation — multi-agent coordination (Group Chat), Git worktrees, Auto Run playbooks, **Symphony OSS contribution platform**, **Director's Notes**, mobile remote control, CLI interface, Playbook Exchange, custom slash commands with template variables
- **Auto-Claude** (v2.7.6): Autonomous multi-agent pipeline — Spec→Plan→Code→QA pipeline, **Kanban board**, **AI roadmap/ideation**, parallel agent terminals (up to 12), Opus 4.6 adaptive thinking, semantic merge, Graphiti memory system, multi-profile auth, PR review orchestration

### Core Principles

1. **Single Source of Truth**: Convex backend for all data persistence
2. **Full Feature Parity**: Desktop (Tauri), Web (Next.js), Mobile (Expo) with identical capabilities
3. **Real-Time Sync**: Changes propagate instantly across all platforms via Convex subscriptions
4. **Unified Notifications**: Novu inbox for all system events
5. **Agent-First Design**: Everything revolves around creating, executing, and monitoring AI agents
6. **Keyboard-First UX**: Quick actions palette, customizable shortcuts, power-user workflows

### System Goals

| Goal | Description | Source |
|------|-------------|--------|
| **Agent Management** | Create, execute, and monitor custom AI agents with hooks | Claudia + Auto-Claude |
| **Workflow Automation** | Batch processing with Auto Run playbooks and template vars | Maestro |
| **Multi-Agent Coordination** | Group Chat with moderator + parallel agent execution | Maestro + Auto-Claude |
| **Timeline Versioning** | Checkpoints with branching tree for conversation history | Claudia |
| **Observability** | Real-time event streaming, activity pulse, session scoring | Claudia |
| **Task Management** | Kanban board with drag-reorder and AI-assisted planning | Auto-Claude |
| **MCP Integration** | Unified server management with import/export | Claudia |
| **Usage Analytics** | Token/cost tracking, heatmaps, agent comparison, CSV export | All three |
| **Git Integration** | Worktree isolation, branch management, PR creation | Maestro + Auto-Claude |
| **AI Pipeline** | Spec creation → planning → coding → QA review loop | Auto-Claude |
| **Mobile Remote** | Monitor/control agents from phone with push notifications | Maestro + Expo |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ALIAS-MOSAIC SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        PLATFORM LAYER                              │ │
│  │                                                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │ │
│  │  │   DESKTOP    │  │     WEB      │  │       MOBILE          │   │ │
│  │  │   (Tauri)    │  │  (Next.js)   │  │     (Expo)            │   │ │
│  │  │              │  │              │  │                       │   │ │
│  │  │ - Rust IPC   │  │ - React SSR  │  │ - React Native        │   │ │
│  │  │ - Native OS  │  │ - Web APIs   │  │ - Native APIs         │   │ │
│  │  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘   │ │
│  └─────────┼──────────────────┼──────────────────────┼────────────────┘ │
│            │                  │                      │                   │
│            └──────────────────┼──────────────────────┘                   │
│                               │                                          │
│  ┌────────────────────────────▼──────────────────────────────────────┐  │
│  │                     SHARED PACKAGES LAYER                         │  │
│  │                                                                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │    UI       │  │   TYPES     │  │    UTILS               │  │  │
│  │  │  Components │  │  (Zod)      │  │  (helpers)             │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│  │                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │              CONVEX CLIENT WRAPPERS                        │  │  │
│  │  │  - React hooks for queries/mutations/actions               │  │  │
│  │  │  - TypeScript types from schema                           │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────┬───────────────────────────────────────┘  │
│                               │                                          │
│  ┌────────────────────────────▼───────────────────────────────────────┐  │
│  │                       CONVEX BACKEND                              │  │
│  │                                                                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │  SCHEMA     │  │  ACTIONS    │  │    AGENTS              │   │  │
│  │  │  (Tables)   │  │  (Server)   │  │  (AI Workers)          │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘   │  │
│  │                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │                    REAL-TIME SYNC                          │  │  │
│  │  │  - Automatic subscriptions via Convex                      │  │  │
│  │  │  - WebSocket-based updates                                 │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────┬───────────────────────────────────────┘  │
│                               │                                          │
│  ┌────────────────────────────▼───────────────────────────────────────┐  │
│  │                     EXTERNAL INTEGRATIONS                         │  │
│  │                                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │  │
│  │  │   Novu   │  │   Git    │  │   MCP    │  │ Claude Code    │   │  │
│  │  │  (Notify)│  │ (Worktree)│  │ (Servers)│  │    (Agents)    │   │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Monorepo: Better-T-Stack Foundation

```bash
~/alias-mosaic-fullstack/
├── apps/
│   ├── web/           # Next.js 16 (SSR, App Router)
│   ├── native/        # Expo 54 (React Native + nativewind)
│   └── desktop/       # Tauri 2 (Rust backend + React frontend)
├── packages/
│   ├── backend/       # Convex schema + functions
│   ├── ui/            # Shared React components
│   ├── types/         # TypeScript/Zod types
│   ├── utils/         # Helper functions
│   └── config/        # Shared configurations
└── infra/             # Cloudflare deployment config
```

### Platform-Specific Technologies

| Platform | Frontend | Backend | Key Libraries |
|----------|----------|---------|---------------|
| **Desktop** | React 19 + Vite | Rust (Tauri 2) | tauri-plugin-shell, rusqlite |
| **Web** | Next.js 16 | Convex (serverless) | @convex-dev/agent, better-auth |
| **Mobile** | React Native | Convex (via Expo) | expo-router, nativewind |
| **Shared** | TypeScript | Convex | convex, zod, @ai-sdk/* |

---

## Data Models

### Convex Schema Overview

```typescript
// Core Tables
agents              // Custom AI agents with prompts
agentRuns           // Agent execution history
conversations       // Claude Code sessions
messages            // Conversation messages
checkpoints         // Timeline snapshots
mcpServers          // MCP server configurations
projects            // Project folders
usageStats          // Token/cost tracking
notifications       // Novu notification log
playbooks           // Auto Run workflows
groupChats          // Multi-agent coordination
gitWorktrees        // Parallel development tracking
achievements        // Gamification badges
```

### Complete Schema Definition

```typescript
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
    aiTabs: v.array(v.object({
      id: v.string(),
      name: v.string(),
      agentSessionId: v.optional(v.string()),
      isStarred: v.boolean(),
      readOnlyMode: v.boolean(),
      saveToHistory: v.boolean(),
      unreadCount: v.number(),
      createdAt: v.number(),
    })),
    activeAITabId: v.string(),

    // File Preview Tabs (from Maestro)
    filePreviewTabs: v.array(v.object({
      id: v.string(),
      filePath: v.string(),
      scrollPosition: v.number(),
    })),
    activeFileTabId: v.optional(v.string()),

    // Auto Run State (from Maestro)
    autoRunFolderPath: v.optional(v.string()),
    autoRunSelectedFile: v.optional(v.string()),
    autoRunMode: v.optional(v.string()), // "edit" | "preview"

    // Execution Queue (from Maestro)
    executionQueue: v.array(v.object({
      id: v.string(),
      type: v.string(), // "user_message" | "autorun_task"
      content: v.string(),
      readOnlyMode: v.boolean(),
      queuedAt: v.number(),
    })),
    isProcessingQueue: v.boolean(),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_updated", ["updatedAt"])
    .searchIndex("search", { searchField: "firstMessage" }),

  messages: defineTable({
    // Reference
    conversationId: v.id("conversations"),

    // Message Content
    role: v.string(), // "user" | "assistant" | "system" | "tool"
    content: v.string(),

    // Tool Usage (from Claude Code)
    toolUse: v.optional(v.array(v.object({
      name: v.string(),
      input: v.any(),
      output: v.optional(v.string()),
      error: v.optional(v.string()),
    }))),

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
    .index("by_conversation_index", ["conversationId", "messageIndex"]),

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
    metadata: v.optional(v.object({
      trigger: v.string(), // "manual" | "auto_prompt" | "auto_tool" | "smart"
      toolsUsed: v.array(v.string()),
      filesModified: v.array(v.string()),
    })),

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
    env: v.optional(v.record(v.string())),
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
  })
    .index("by_path", ["path"]),

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
    documents: v.array(v.object({
      path: v.string(), // Relative to autoRunFolderPath
      order: v.number(),
    })),
    enableLoop: v.boolean(),
    enableReset: v.boolean(),
    worktreeEnabled: v.boolean(),

    // Custom Prompt (with template variables)
    customPrompt: v.string(),

    // Metadata
    projectId: v.optional(v.id("projects")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"]),

  // ============================================
  // GROUP CHAT (Multi-Agent Coordination from Maestro)
  // ============================================
  groupChats: defineTable({
    // Identity
    name: v.string(),
    description: v.optional(v.string()),

    // Configuration
    moderatorAgentId: v.string(),
    moderatorConfig: v.optional(v.object({
      customPath: v.optional(v.string()),
      customModel: v.optional(v.string()),
    })),

    // Participants
    participants: v.array(v.object({
      id: v.string(),
      name: v.string(),
      agentId: v.string(),
      systemPrompt: v.optional(v.string()),
    })),

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
  })
    .index("by_group_chat", ["groupChatId"]),

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
});
```

---

## API Reference

### Queries

#### Project & Session Queries

```typescript
// List all projects
const projects = await cx.query.api.projects.list();

// Get project with conversations
const project = await cx.query.api.projects.get({ id: projectId });

// Get conversations in a project
const conversations = await cx.query.api.conversations.list({ projectId });

// Get conversation with messages
const conversation = await cx.query.api.conversations.get({ id });
```

#### Agent Queries

```typescript
// List all agents
const agents = await cx.query.api.agents.list();

// Get agent details
const agent = await cx.query.api.agents.get({ id });

// Get agent run history
const runs = await cx.query.api.agents.listRuns({ agentId });
```

#### Timeline Queries

```typescript
// Get checkpoints for a conversation
const checkpoints = await cx.query.api.checkpoints.list({ conversationId });

// Get checkpoint tree (with branches)
const tree = await cx.query.api.checkpoints.getTree({ conversationId });

// Get file snapshot at checkpoint
const snapshot = await cx.query.api.fileSnapshots.get({ checkpointId, filePath });
```

### Mutations

#### Agent Operations

```typescript
// Create agent
const agent = await cx mutation.api.agents.create({
  name: "Frontend Developer",
  icon: "code",
  systemPrompt: "You are a React expert...",
  model: "claude-sonnet-4-20250514",
  enableFileRead: true,
  enableFileWrite: true,
  enableNetwork: false,
});

// Update agent
await cx.mutation.api.agents.update({
  id: agentId,
  updates: { systemPrompt: "Updated prompt..." },
});

// Delete agent
await cx.mutation.api.agents.remove({ id: agentId });

// Execute agent (creates agentRun)
const run = await cx.mutation.api.agents.execute({
  agentId,
  task: "Build a login form",
  projectPath: "/path/to/project",
  conversationId, // Optional: link to conversation
});
```

#### Conversation Operations

```typescript
// Create conversation
const conversation = await cx.mutation.api.conversations.create({
  projectId,
  name: "Build feature X",
});

// Send message
const message = await cx.mutation.api.conversations.sendMessage({
  conversationId,
  role: "user",
  content: "Create a React component for...",
  aiTabId, // Optional: send to specific tab
});

// Create checkpoint
const checkpoint = await cx.mutation.api.checkpoints.create({
  conversationId,
  messageIndex,
  description: "Before refactoring",
});
```

### Actions

#### Complex Operations

```typescript
// Fork conversation from checkpoint
const forked = await cx.action.api.conversations.fork({
  conversationId,
  checkpointId,
  newName: "Alternative approach",
});

// Apply checkpoint (restore state)
await cx.action.api.checkpoints.apply({
  checkpointId,
  conversationId,
});

// Run Auto Run playbook
const result = await cx.action.api.playbooks.execute({
  playbookId,
  projectPath,
});
```

---

## Platform-Specific Implementation

### Desktop (Tauri)

**File:** `apps/desktop/src-tauri/src/commands.rs`

```rust
// Agent execution with process spawning
#[tauri::command]
async fn execute_agent(
    agent_id: String,
    task: String,
    project_path: String,
    conversation_id: Option<String>,
) -> Result<AgentRunResult, String> {
    // 1. Fetch agent config from Convex
    let agent = convex_client.get_agent(agent_id).await?;

    // 2. Build Claude Code command
    let cmd = build_claude_command(&agent, &task, &project_path);

    // 3. Spawn process
    let child = Command::new(&cmd.program)
        .args(&cmd.args)
        .current_dir(&project_path)
        .spawn()?;

    let pid = child.id();

    // 4. Create agentRun record in Convex
    let run_id = convex_client.create_agent_run(
        agent_id.clone(),
        task,
        pid as i32,
        conversation_id,
    ).await?;

    // 5. Monitor process and update Convex on completion
    monitor_process(child, run_id).await?;

    Ok(AgentRunResult { run_id, pid })
}
```

### Web (Next.js)

**File:** `apps/web/app/dashboard/page.tsx`

```typescript
"use client";

import { useQuery, useMutation } from "@convex-dev/react";
import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";

export function ConversationsList() {
  // Real-time subscription to conversations
  const conversations = useQuery(
    api.conversations.list,
    { projectId: "current" }
  );

  const executeAgent = useMutation(api.agents.execute);

  return (
    <div>
      {conversations?.map(conv => (
        <ConversationCard
          key={conv._id}
          conversation={conv}
          onExecuteAgent={(agentId, task) =>
            executeAgent.mutate({ agentId, task, projectPath: conv.projectPath })
          }
        />
      ))}
    </div>
  );
}
```

### Mobile (Expo)

**File:** `apps/native/app/(tabs)/conversations.tsx`

```typescript
import { useQuery, useMutation } from "@convex-dev/expo";
import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";

export function ConversationsScreen() {
  const router = useRouter();
  const conversations = useQuery(api.conversations.list, {});

  // Pull-to-refresh
  const onRefresh = () => {
    refetch();
  };

  return (
    <ScrollView refreshControl={<RefreshControl onRefresh={onRefresh} />}>
      {conversations?.map(conv => (
        <Pressable
          key={conv._id}
          onPress={() => router.push(`/chat/${conv._id}`)}
        >
          <ConversationCard conversation={conv} />
        </Pressable>
      ))}
    </ScrollView>
  );
}
```

---

## Real-Time Updates

Convex provides automatic real-time subscriptions:

```typescript
// In any React component (web, desktop, or mobile)
import { useQuery } from "@convex-dev/react";

function ConversationPanel({ conversationId }: Props) {
  // This automatically re-renders when new messages arrive
  const messages = useQuery(api.messages.list, { conversationId });
  const checkpoint = useQuery(api.checkpoints.getCurrent, { conversationId });

  return (
    <div>
      {messages?.map(msg => <MessageBubble key={msg._id} message={msg} />)}

      <CheckpointBranch
        currentCheckpoint={checkpoint}
        onFork={(checkpointId) => forkFromCheckpoint(checkpointId)}
      />
    </div>
  );
}
```

---

## Notification System

### Novu Integration

**File:** `packages/backend/convex/notifications.ts`

```typescript
import { Novu } from '@novu/node';

const novu = new Novu(process.env.NOVU_API_KEY);

export const notify = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    type: v.string(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Create notification record in Convex
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      body: args.body,
      type: args.type,
      actionUrl: args.actionUrl,
      read: false,
      createdAt: Date.now(),
    });

    // 2. Send to Novu
    const novuResult = await novu.trigger('notification-event', {
      to: { subscriberId: args.userId },
      payload: {
        title: args.title,
        body: args.body,
        url: args.actionUrl,
      },
    });

    // 3. Update notification with Novu ID
    await ctx.db.patch(notificationId, {
      novuId: novuResult.id,
    });

    return notificationId;
  },
});
```

### Notification Types

| Type | Trigger | Action |
|------|---------|--------|
| `agent_complete` | Agent run finishes | View results |
| `checkpoint_created` | Manual checkpoint created | Restore checkpoint |
| `checkpoint_auto` | Auto checkpoint created | View timeline |
| `mcp_connected` | MCP server connects | View server |
| `mcp_error` | MCP server error | View logs |
| `playbook_complete` | Auto Run finishes | View results |
| `group_chat_message` | New Group Chat message | Open chat |
| `achievement_unlocked` | New badge earned | View achievements |

---

## Reference Repos & Feature Sources

This project synthesizes features from three reference repositories:

| Repo | Location | Branch | Description |
|------|----------|--------|-------------|
| **Claudia** | `~/Documents/GitHub/claudia/` | `feature/multi-agent-observability` | Desktop GUI for Claude Code (Tauri 2 + React 18) |
| **Maestro** | `~/Documents/GitHub/Maestro/` | `main` (v0.15.0) | Workflow automation & multi-agent coordination (Electron + React) |
| **Auto-Claude** | `~/Auto-Claude/` | `develop` (v2.7.6) | Autonomous multi-agent pipeline (Electron + React 19 + Python backend) |

### Feature Matrix — What Comes From Where

| Feature | Claudia | Maestro | Auto-Claude | MOSAIC Target |
|---------|---------|---------|-------------|---------------|
| Agent CRUD & Execution | SQLite + Rust IPC | File JSON + IPC | Python agents + SDK | Convex |
| Session Management | SQLite sessions | File-based sessions | PTY sessions | Convex real-time |
| Timeline/Checkpoints | Git-based checkpoints | - | Git worktree isolation | Convex + branching |
| Multi-Agent Observability | Warp HTTP + WebSocket | Director's Notes | Parallel agent terminals | Convex subscriptions |
| Usage Analytics | Rust JSONL parser | Activity heatmaps + CSV export | Token tracking per phase | Convex aggregation |
| MCP Server Management | Import/export + status | MCP documentation server | - | Convex + platform APIs |
| Auto Run / Playbooks | - | Markdown-based + Playbook Exchange | Spec→Plan→Code→QA pipeline | Convex + scheduled |
| Group Chat | - | Moderator-orchestrated | PR review multi-agent | Convex real-time |
| Git Worktrees | - | Parallel worktree agents | Isolated worktrees per build | Convex tracking |
| Kanban / Task Board | - | - | Drag-reorder Kanban | Convex todos |
| Roadmap / Ideation | - | - | AI-assisted roadmap + ideation | Convex + AI SDK |
| Agent Import/Export | `.claudia.json` + GitHub | - | - | Convex + file export |
| Mobile Remote Control | - | QR code + web server + Cloudflare tunnel | - | Expo native |
| CLI Interface | - | `maestro-cli` (Node.js) | Python CLI (`spec`, `build`, `qa`) | - |
| Insights Chat | - | - | Real-time streaming AI chat | AI SDK + Convex |
| Security Scanning | Pre-built SAST agent | - | OS sandbox + filesystem restrictions | Convex actions |
| Keyboard-First Design | - | `Cmd+K` quick actions | `Ctrl+K` expand/collapse | Both web + native |
| Conductor Profile | - | "About Me" injected into agents | - | User settings |
| Custom Slash Commands | - | Template variables + autocomplete | - | Convex + UI |
| Document Graph | - | Knowledge graph + wiki-links | - | Future |
| Symphony (OSS Contrib) | - | Single-click OSS contribution platform | - | Future |
| Semantic Merge | - | - | AI-powered conflict resolution | Future |
| Memory System | - | - | Graphiti/LadybugDB graph memory | Future |

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up Convex schema (all tables from Data Models section)
- [ ] Create shared types package with Zod validators
- [ ] Implement basic queries/mutations for all core tables
- [ ] Set up authentication with Better Auth
- [ ] Configure Turborepo pipeline (dev, build, typecheck, lint)
- [ ] Environment variables package (`packages/env`)
- [ ] Convex deployment and development workflow

### Phase 2: Agent System (Weeks 3-4)
*Sources: Claudia agent CRUD, Auto-Claude agent pipeline, Maestro multi-agent*
- [ ] Agent CRUD operations (create, read, update, delete)
- [ ] Agent execution engine (Convex actions → Claude Code CLI)
- [ ] Agent run tracking with real-time status updates
- [ ] Agent permission model (file read/write, network access)
- [ ] Agent hooks configuration (JSON-based lifecycle hooks)
- [ ] Pre-built agent library (Git Commit Bot, Security Scanner, Unit Tests Bot)
- [ ] Agent import/export (`.claudia.json` format compatibility)
- [ ] Agent model selection (Opus 4.6, Sonnet 4.6, Haiku 4.5)

### Phase 3: Conversation & Session Management (Weeks 5-6)
*Sources: Claudia sessions, Maestro session pool, Auto-Claude terminals*
- [ ] Conversation management with project context
- [ ] Message streaming with real-time Convex subscriptions
- [ ] Multi-tab AI sessions (from Maestro dual-mode)
- [ ] Session resume and history browsing
- [ ] Session search (fuzzy search across projects)
- [ ] Execution queue for batch message processing
- [ ] File preview tabs within conversations
- [ ] Conductor profile — user "About Me" injected into agent prompts

### Phase 4: Timeline & Checkpoints (Weeks 7-8)
*Sources: Claudia timeline navigator, Auto-Claude git isolation*
- [ ] Timeline/checkpoint creation (manual + auto strategies)
- [ ] Checkpoint tree with branching (parent-child relationships)
- [ ] File snapshot storage with SHA-256 deduplication
- [ ] Fork conversation from any checkpoint
- [ ] Restore/apply checkpoint state
- [ ] Smart checkpoint triggers (per-prompt, per-tool-use, smart)

### Phase 5: Observability & Analytics (Weeks 9-10)
*Sources: Claudia observability dashboard, Maestro usage analytics, Auto-Claude metrics*
- [ ] Real-time event stream dashboard
- [ ] Session performance tracking and scoring
- [ ] Activity pulse visualization (time-windowed)
- [ ] Usage analytics by model, project, and time period
- [ ] Token/cost tracking with Claude 4 pricing
- [ ] Activity heatmaps (GitHub-style)
- [ ] Agent comparison charts
- [ ] CSV export capability
- [ ] Novu notification integration for key events

### Phase 6: Auto Run & Playbooks (Weeks 11-12)
*Sources: Maestro Auto Run system, Auto-Claude spec pipeline*
- [ ] Auto Run with markdown document processing
- [ ] Playbook CRUD (name, documents, loop config, custom prompts)
- [ ] Playbook execution engine (sequential document processing)
- [ ] Template variables in prompts (`{{AGENT_NAME}}`, `{{DOCUMENT_PATH}}`, etc.)
- [ ] Custom slash commands with template substitution
- [ ] Playbook import from community library
- [ ] Local manifest support for private playbooks
- [ ] Loop behavior (configurable max iterations, reset on completion)

### Phase 7: Multi-Agent Coordination (Weeks 13-14)
*Sources: Maestro Group Chat, Auto-Claude parallel agents, Claudia multi-agent*
- [ ] Group Chat with moderator AI pattern
- [ ] Participant management (add/remove agents)
- [ ] Message routing — moderator delegates to specialists
- [ ] Response synthesis — moderator summarizes multi-agent output
- [ ] Parallel agent execution (up to 12 concurrent)
- [ ] Task decomposition (plan → subtask → execute → review)
- [ ] QA review loop (reviewer → fixer, max 3 iterations)

### Phase 8: MCP & Integrations (Weeks 15-16)
*Sources: Claudia MCP manager, Maestro MCP docs server*
- [ ] MCP server CRUD (stdio, SSE, HTTP transports)
- [ ] MCP server status monitoring (connecting, connected, error)
- [ ] MCP import/export configuration
- [ ] Scope management (local, project, user)
- [ ] Claude Desktop config import
- [ ] Git integration (repo detection, branch display, worktree operations)
- [ ] Git worktree isolation for parallel development

### Phase 9: Platform UIs (Weeks 17-20)
*All three reference repos inform the UI/UX*
- [ ] **Web (Next.js)**: Full dashboard with responsive design
  - Agent management grid
  - Conversation panel with message streaming
  - Timeline navigator with branch visualization
  - Usage analytics dashboards
  - Settings and conductor profile
- [ ] **Mobile (Expo)**: Native experience
  - Agent list and execution
  - Conversation view with pull-to-refresh
  - Push notifications via Novu
  - QR code pairing with desktop (from Maestro mobile remote)
  - Checkpoint browsing
- [ ] **Desktop (Tauri)**: Native OS integration (future)
  - Direct Claude Code process spawning
  - Native file system access
  - System tray with agent status
  - PTY terminal integration

### Phase 10: Advanced Features (Weeks 21-24)
*Sources: Auto-Claude Kanban/Roadmap/Ideation, Maestro Symphony/Director/Document Graph*
- [ ] Kanban task board with drag-reorder
- [ ] AI-assisted roadmap generation with phase planning
- [ ] Ideation engine (discover improvements across 6 categories)
- [ ] Insights chat — streaming AI for codebase exploration
- [ ] Director's Notes — unified history timeline across all agents
- [ ] Document graph visualization (knowledge graph of docs)
- [ ] Achievement/gamification system (badge levels 1-15)
- [ ] Keyboard-first design (`Cmd+K` quick actions)
- [ ] Custom themes and appearance settings

---

## New Schema Additions

Based on reference repo analysis, the following tables should be added to the Convex schema:

```typescript
// ============================================
// KANBAN TASKS (from Auto-Claude)
// ============================================
tasks: defineTable({
  projectId: v.id("projects"),
  title: v.string(),
  description: v.optional(v.string()),
  status: v.string(), // "backlog" | "todo" | "in_progress" | "review" | "done"
  priority: v.string(), // "low" | "medium" | "high" | "critical"
  order: v.number(), // For drag-reorder within column
  assignedAgentId: v.optional(v.id("agents")),
  referenceImages: v.optional(v.array(v.string())), // Storage IDs
  parentTaskId: v.optional(v.id("tasks")), // For subtasks
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project_status", ["projectId", "status"])
  .index("by_parent", ["parentTaskId"]),

// ============================================
// ROADMAP (from Auto-Claude)
// ============================================
roadmapPhases: defineTable({
  projectId: v.id("projects"),
  name: v.string(),
  description: v.optional(v.string()),
  order: v.number(),
  status: v.string(), // "planned" | "active" | "completed"
  features: v.array(v.object({
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
  })),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"]),

// ============================================
// OBSERVABILITY EVENTS (from Claudia)
// ============================================
observabilityEvents: defineTable({
  sessionId: v.string(),
  sourceApp: v.string(),
  eventType: v.string(),
  toolName: v.optional(v.string()),
  payload: v.optional(v.any()),
  summary: v.optional(v.string()),
  timestamp: v.number(),
})
  .index("by_session", ["sessionId"])
  .index("by_type", ["eventType"])
  .index("by_timestamp", ["timestamp"]),

// ============================================
// SLASH COMMANDS (from Maestro)
// ============================================
slashCommands: defineTable({
  name: v.string(), // e.g., "deploy", "review"
  prompt: v.string(), // Template with {{VARIABLES}}
  description: v.optional(v.string()),
  projectId: v.optional(v.id("projects")), // null = global
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"]),

// ============================================
// CONDUCTOR PROFILE (from Maestro)
// ============================================
conductorProfiles: defineTable({
  userId: v.string(),
  aboutMe: v.string(), // Injected into all agent prompts
  preferences: v.optional(v.object({
    defaultModel: v.optional(v.string()),
    defaultTheme: v.optional(v.string()),
    keyboardShortcuts: v.optional(v.record(v.string())),
  })),
  globalEnvVars: v.optional(v.record(v.string())),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"]),

// ============================================
// GIT WORKTREES (expanded from original)
// ============================================
gitWorktrees: defineTable({
  projectId: v.id("projects"),
  agentRunId: v.optional(v.id("agentRuns")),
  branchName: v.string(),
  worktreePath: v.string(),
  baseBranch: v.string(),
  status: v.string(), // "active" | "merged" | "abandoned" | "pr_created"
  prUrl: v.optional(v.string()),
  createdAt: v.number(),
  cleanedUpAt: v.optional(v.number()),
})
  .index("by_project", ["projectId"])
  .index("by_status", ["status"]),
```

---

## Migration Strategy

### From Claudia (SQLite to Convex)

**1. Export CLI (Rust)**

```rust
// apps/desktop/src-tauri/src/migrate.rs

use sqlx::SqlitePool;

pub async fn export_claudia_data(pool: &SqlitePool) -> MigrationData {
    // Export agents
    let agents = sqlx::query_as::<_, Agent>("SELECT * FROM agents")
        .fetch_all(pool)
        .await?;

    // Export sessions (→ conversations)
    let sessions = sqlx::query_as::<_, Session>("SELECT * FROM sessions")
        .fetch_all(pool)
        .await?;

    // Export checkpoints
    let checkpoints = sqlx::query_as::<_, Checkpoint>("SELECT * FROM checkpoints")
        .fetch_all(pool)
        .await?;

    // NEW: Export observability events
    let events = sqlx::query_as::<_, ObservabilityEvent>(
        "SELECT * FROM observability_events ORDER BY timestamp"
    )
        .fetch_all(pool)
        .await?;

    MigrationData { agents, sessions, checkpoints, events }
}
```

**2. Import Script (TypeScript)**

```typescript
// scripts/migrate-claudia.ts

import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.VITE_CONVEX_URL!);

async function importData(data: MigrationData) {
  // Import agents
  for (const agent of data.agents) {
    await convex.mutation(api.migrations.importAgent, {
      name: agent.name,
      icon: agent.icon,
      systemPrompt: agent.system_prompt,
      model: agent.model,
      enableFileRead: agent.enable_file_read,
      enableFileWrite: agent.enable_file_write,
      enableNetwork: agent.enable_network,
      hooks: agent.hooks,
    });
  }

  // Import conversations
  for (const session of data.sessions) {
    await convex.mutation(api.migrations.importConversation, {
      projectId: session.project_id,
      name: session.name,
      createdAt: session.created_at,
    });
  }
}
```

### From Maestro (JSON to Convex)

Maestro v0.15.0 uses file-based JSON storage with session pool architecture:

```typescript
// scripts/migrate-maestro.ts

import fs from "fs/promises";
import path from "path";

const MAESTRO_DATA_PATH = process.env.MAESTRO_DATA_PATH
  ?? "~/Library/Application Support/maestro";

async function migrateMaestroData() {
  // Read sessions
  const sessionsPath = path.join(MAESTRO_DATA_PATH, "maestro-sessions.json");
  const sessions = JSON.parse(await fs.readFile(sessionsPath, "utf-8"));

  // Read playbooks
  const playbooksPath = path.join(MAESTRO_DATA_PATH, "playbooks");
  const playbooks = await discoverPlaybooks(playbooksPath);

  // Read custom commands
  const commandsPath = path.join(MAESTRO_DATA_PATH, "commands.json");
  const commands = JSON.parse(await fs.readFile(commandsPath, "utf-8"));

  // Import sessions to Convex
  for (const session of Object.values(sessions)) {
    await convex.mutation(api.migrations.importMaestroSession, {
      name: session.name,
      toolType: session.toolType,
      cwd: session.cwd,
      aiLogs: session.aiLogs,
    });
  }

  // Import playbooks
  for (const playbook of playbooks) {
    await convex.mutation(api.migrations.importPlaybook, {
      name: playbook.title,
      description: playbook.description,
      documents: playbook.documents,
      enableLoop: playbook.loopEnabled,
      customPrompt: playbook.prompt ?? "",
    });
  }

  // Import custom slash commands
  for (const cmd of commands) {
    await convex.mutation(api.migrations.importSlashCommand, {
      name: cmd.trigger,
      prompt: cmd.prompt,
      description: cmd.description,
    });
  }
}
```

### From Auto-Claude (Python Backend to Convex)

Auto-Claude v2.7.6 uses a Python backend with Electron frontend:

```typescript
// scripts/migrate-auto-claude.ts

import fs from "fs/promises";
import path from "path";

async function migrateAutoClaudeData() {
  // Read task data from Auto-Claude's local storage
  const tasksPath = path.join(
    process.env.AUTO_CLAUDE_DATA ?? "~/Library/Application Support/auto-claude",
    "tasks.json"
  );
  const tasks = JSON.parse(await fs.readFile(tasksPath, "utf-8"));

  // Import Kanban tasks
  for (const task of tasks) {
    await convex.mutation(api.migrations.importTask, {
      title: task.title,
      description: task.description,
      status: mapStatus(task.status),
      priority: task.priority ?? "medium",
    });
  }

  // Import roadmap phases
  const roadmapPath = path.join(
    process.env.AUTO_CLAUDE_DATA ?? "~/Library/Application Support/auto-claude",
    "roadmap.json"
  );
  if (await fileExists(roadmapPath)) {
    const phases = JSON.parse(await fs.readFile(roadmapPath, "utf-8"));
    for (const phase of phases) {
      await convex.mutation(api.migrations.importRoadmapPhase, {
        name: phase.name,
        description: phase.description,
        features: phase.features,
      });
    }
  }
}
```

---

## Reference Repo Sync

Keep reference repos up to date for ongoing feature alignment:

```bash
# Pull latest from all three reference repos
cd ~/Documents/GitHub/claudia && git stash && git pull && git stash pop
cd ~/Documents/GitHub/Maestro && git stash && git pull origin main && git stash pop
cd ~/Auto-Claude && git stash && git pull origin develop && git stash pop
```

---

**Document Version:** 2.0
**Last Updated:** 2026-02-24
**Reference Versions:** Claudia (multi-agent-observability), Maestro v0.15.0, Auto-Claude v2.7.6
**Status:** Ready for Implementation
