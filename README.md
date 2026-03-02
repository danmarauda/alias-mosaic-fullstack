# ALIAS MOSAIC

**AI-Powered Agentic Orchestration Platform** — A full-stack multi-agent coordination system with real-time collaboration, checkpoint management, and comprehensive theming.

## Overview

ALIAS MOSAIC is a production-ready platform for orchestrating AI agents at scale. It provides a unified interface for managing conversations, agents, tasks, projects, and more — all powered by a reactive Convex backend with real-time synchronization.

## Features

### Core Platform
- **Multi-Agent Orchestration** — Coordinate multiple AI agents with role-based specializations
- **Real-time Conversations** — Live chat with conversation branching and search
- **Group Chat** — Multi-agent collaborative conversations
- **Checkpoint System** — Save, restore, and branch conversation states
- **Task Management** — Comprehensive task tracking with dependencies
- **Project Organization** — Organize work into projects with roadmap phases
- **Playbooks** — Reusable agent instruction templates

### Web Application (`apps/web`)
- **Next.js 15** with App Router and React 19
- **11 Built-in Themes** — light, dark, vibe, ocean, sunset, aurora, cosmic, dracula, github-light, nord, monokai
- **System Preference Detection** — Automatic light/dark mode switching
- **Maestro-style Animations** — Smooth transitions and micro-interactions
- **PWA Support** — Install as a progressive web app
- **Tauri Desktop** — Native desktop application support

### Mobile Application (`apps/native`)
- **React Native + Expo** — Cross-platform mobile app
- **NativeWind** — Tailwind CSS for React Native
- **iOS & Android** — Single codebase for both platforms

### Backend (`packages/backend`)
- **Convex** — Reactive backend-as-a-service
- **Real-time Sync** — Automatic UI updates on data changes
- **40+ Backend Functions** — Comprehensive API coverage

### Integrations
- **GitHub Integration** — Repository connection and sync
- **GitLab Integration** — Enterprise Git support
- **MCP Server Management** — Model Context Protocol servers
- **Analytics Dashboard** — Usage insights and metrics

### Developer Experience
- **TypeScript** — Full type safety across the stack
- **Turborepo** — Optimized monorepo builds
- **Biome + Oxlint** — Fast linting and formatting
- **Husky** — Git hooks for code quality

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Mobile | React Native, Expo, NativeWind |
| Backend | Convex, Better-Auth |
| Styling | Tailwind CSS v4, shadcn/ui |
| State | React Context, Convex Queries |
| Desktop | Tauri 2 |
| Build | Turborepo, Bun |
| Linting | Biome, Oxlint |

## Project Structure

```
alias-mosaic-fullstack/
├── apps/
│   ├── web/              # Next.js web application
│   │   ├── src/app/      # App Router pages
│   │   ├── src/components/  # UI components
│   │   └── src/lib/      # Utilities and clients
│   ├── native/           # React Native mobile app
│   └── fumadocs/         # Documentation site
├── packages/
│   ├── backend/          # Convex backend
│   │   └── convex/       # Functions and schema
│   ├── env/              # Environment configurations
│   └── config/           # Shared configurations
```

## Getting Started

### Prerequisites
- Node.js 18+
- Bun 1.3+
- Expo CLI (for mobile)

### Installation

```bash
# Install dependencies
bun install

# Setup Convex backend
bun run dev:setup

# Copy environment variables
cp packages/backend/.env.local apps/web/.env
cp packages/backend/.env.local apps/native/.env
```

### Development

```bash
# Start all apps
bun run dev

# Start web only
bun run dev:web

# Start mobile only
bun run dev:native

# Start desktop (Tauri)
cd apps/web && bun run desktop:dev
```

### Build

```bash
# Build all apps
bun run build

# Type check
bun run check-types

# Lint and format
bun run check
```

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Home dashboard |
| `/agents` | Agent management and configuration |
| `/ai` | AI chat interface |
| `/checkpoints` | Saved conversation states |
| `/conversations` | Conversation history |
| `/group-chat` | Multi-agent conversations |
| `/mcp` | MCP server management |
| `/playbooks` | Reusable agent templates |
| `/projects` | Project organization |
| `/roadmap` | Roadmap phases |
| `/tasks` | Task management |
| `/todos` | Personal todos |
| `/analytics` | Usage analytics |
| `/settings` | Application settings |
| `/settings/github` | GitHub integration |
| `/settings/gitlab` | GitLab integration |
| `/changelog` | Change history |
| `/ideation` | Idea capture |

## Theming

ALIAS MOSAIC includes a comprehensive theming system with 11 built-in themes:

**Light Themes:** `light`, `github-light`, `sunset`
**Dark Themes:** `dark`, `vibe`, `ocean`, `aurora`, `cosmic`, `dracula`, `nord`, `monokai`

```tsx
import { ThemeProvider, useTheme } from "@/components/theme-provider";

// Wrap your app
<ThemeProvider defaultMode="system">
  <App />
</ThemeProvider>

// Use in components
const { theme, setTheme, isDark, colors } = useTheme();
```

## Deployment

### Cloudflare (via Alchemy)

```bash
# Development
cd apps/web && bun run alchemy dev

# Deploy
cd apps/web && bun run deploy

# Destroy
cd apps/web && bun run destroy
```

### Convex

The backend is deployed automatically via Convex cloud. Run `bun run dev:setup` to connect your project.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development |
| `bun run dev:web` | Start web app only |
| `bun run dev:native` | Start mobile app only |
| `bun run build` | Build all applications |
| `bun run check-types` | TypeScript type checking |
| `bun run check` | Format and lint with Biome/Oxlint |
| `bun run prepare` | Initialize git hooks |

## Backend Functions

The Convex backend includes 40+ functions across:

- **Agent Management** — `agents.ts`, `agentRuns.ts`, `agentLibrary.ts`
- **Conversations** — `conversations.ts`, `chat.ts`, `groupChats.ts`
- **Tasks** — `todos.ts`, `tasks.ts`, `projects.ts`
- **Checkpoints** — `checkpoints.ts`, `checkpointTree.ts`
- **Integrations** — `github.ts`, `gitlab.ts`, `mcpServers.ts`
- **Analytics** — `analytics.ts`, `usageStats.ts`, `achievements.ts`
- **And more** — See `packages/backend/convex/` for full list

## License

MIT

## Credits

Created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)
