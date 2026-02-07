import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("agents").withIndex("by_created").order("desc").collect();
  },
});

export const getById = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    systemPrompt: v.string(),
    defaultTask: v.optional(v.string()),
    model: v.string(),
    enableFileRead: v.boolean(),
    enableFileWrite: v.boolean(),
    enableNetwork: v.boolean(),
    hooks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("agents", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    defaultTask: v.optional(v.string()),
    model: v.optional(v.string()),
    enableFileRead: v.optional(v.boolean()),
    enableFileWrite: v.optional(v.boolean()),
    enableNetwork: v.optional(v.boolean()),
    hooks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const { agentId, ...patch } = args;
    await ctx.db.patch(agentId, { ...patch, updatedAt: Date.now() });
    return await ctx.db.get(agentId);
  },
});

export const remove = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.agentId);
    return { success: true };
  },
});
