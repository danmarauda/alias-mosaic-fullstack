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
9. [Development Phases](#development-phases)
10. [Migration Strategy](#migration-strategy)

---

## Overview

ALIAS-MOSAIC is a unified multi-platform AI orchestration system combining the best features from:

- **Auto-claude (Claudia)**: Desktop GUI for Claude Code with custom agents, MCP management, timelines
- **Maestro**: Workflow automation, multi-agent coordination (Group Chat), Git worktrees, playbooks

### Core Principles

1. **Single Source of Truth**: Convex backend for all data persistence
2. **Full Feature Parity**: Desktop (Tauri), Web (Next.js), Mobile (Expo) with identical capabilities
3. **Real-Time Sync**: Changes propagate instantly across all platforms
4. **Unified Notifications**: Novu inbox for all system events

### System Goals

| Goal | Description |
|------|-------------|
| **Agent Management** | Create, execute, and monitor custom AI agents |
| **Workflow Automation** | Batch processing with Auto Run playbooks |
| **Multi-Agent Coordination** | Group Chat with moderator pattern |
| **Timeline Versioning** | Checkpoints for conversation history |
| **MCP Integration** | Unified server management across platforms |
| **Usage Analytics** | Track costs, tokens, and performance |
| **Git Integration** | Worktree isolation for parallel development |

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

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up Convex schema
- [ ] Create shared types package
- [ ] Implement basic queries/mutations
- [ ] Set up authentication with Better Auth

### Phase 2: Core Features (Weeks 3-4)
- [ ] Agent CRUD operations
- [ ] Conversation management
- [ ] Message streaming
- [ ] Basic UI components

### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Timeline/checkpoint system
- [ ] MCP server management
- [ ] Usage analytics
- [ ] Novu notifications

### Phase 4: Platform Polish (Weeks 7-8)
- [ ] Tauri desktop app
- [ ] Expo mobile app
- [ ] Responsive web design
- [ ] Cross-platform testing

### Phase 5: Maestro Features (Weeks 9-10)
- [ ] Auto Run / Playbooks
- [ ] Group Chat
- [ ] Git worktree integration
- [ ] Achievement system

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

    MigrationData { agents, sessions, checkpoints }
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
      // ... map other fields
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

Maestro uses file-based JSON storage. Migration:

```typescript
// scripts/migrate-maestro.ts

import fs from "fs/promises";
import path from "path";

const MAESTRO_DATA_PATH = process.env.MAESTRO_DATA_PATH
  ?? "~/Library/Application Support/maestro";

async function migrateMaestroData() {
  // Read sessions.json
  const sessionsPath = path.join(MAESTRO_DATA_PATH, "maestro-sessions.json");
  const sessions = JSON.parse(await fs.readFile(sessionsPath, "utf-8"));

  // Import to Convex
  for (const session of Object.values(sessions)) {
    await convex.mutation(api.migrations.importMaestroSession, {
      name: session.name,
      toolType: session.toolType,
      cwd: session.cwd,
      aiLogs: session.aiLogs,
      // ... map other fields
    });
  }
}
```

---

**Document Version:** 1.0
**Last Updated:** 2025-02-07
**Status:** Ready for Implementation
