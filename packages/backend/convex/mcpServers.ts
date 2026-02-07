import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    scope: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    if (args.projectId) {
      return await ctx.db
        .query("mcpServers")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
    }

    const { scope } = args;
    if (scope) {
      return await ctx.db
        .query("mcpServers")
        .withIndex("by_scope", (q) => q.eq("scope", scope))
        .collect();
    }

    return await ctx.db.query("mcpServers").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    transport: v.string(),
    command: v.optional(v.string()),
    args: v.optional(v.array(v.string())),
    env: v.optional(v.record(v.string(), v.string())),
    url: v.optional(v.string()),
    scope: v.string(),
    projectId: v.optional(v.id("projects")),
    importedFromClaudeDesktop: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("mcpServers", {
      name: args.name,
      transport: args.transport,
      command: args.command,
      args: args.args,
      env: args.env,
      url: args.url,
      scope: args.scope,
      projectId: args.projectId,
      isActive: false,
      status: "disconnected",
      lastError: undefined,
      importedFromClaudeDesktop: args.importedFromClaudeDesktop,
      addedAt: now,
      lastConnectedAt: undefined,
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    serverId: v.id("mcpServers"),
    name: v.optional(v.string()),
    transport: v.optional(v.string()),
    command: v.optional(v.string()),
    args: v.optional(v.array(v.string())),
    env: v.optional(v.record(v.string(), v.string())),
    url: v.optional(v.string()),
    scope: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const server = await ctx.db.get(args.serverId);
    if (!server) {
      throw new Error("MCP server not found");
    }

    const { serverId, ...patch } = args;
    await ctx.db.patch(serverId, patch);
    return await ctx.db.get(serverId);
  },
});

export const updateStatus = mutation({
  args: {
    serverId: v.id("mcpServers"),
    status: v.string(),
    isActive: v.boolean(),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.serverId, {
      status: args.status,
      isActive: args.isActive,
      lastError: args.lastError,
      lastConnectedAt: args.isActive ? Date.now() : undefined,
    });
    return await ctx.db.get(args.serverId);
  },
});

export const remove = mutation({
  args: { serverId: v.id("mcpServers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.serverId);
    return { success: true };
  },
});
