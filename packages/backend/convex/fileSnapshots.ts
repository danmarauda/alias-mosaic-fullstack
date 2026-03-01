import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const listByCheckpoint = query({
	args: { checkpointId: v.id("checkpoints") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("fileSnapshots")
			.withIndex("by_checkpoint", (q) =>
				q.eq("checkpointId", args.checkpointId)
			)
			.collect();
	},
});

export const createMany = mutation({
	args: {
		checkpointId: v.id("checkpoints"),
		snapshots: v.array(
			v.object({
				filePath: v.string(),
				content: v.string(),
				hash: v.string(),
				isDeleted: v.boolean(),
				permissions: v.optional(v.number()),
				size: v.number(),
			})
		),
	},
	handler: async (ctx, args) => {
		let count = 0;
		for (const snapshot of args.snapshots) {
			await ctx.db.insert("fileSnapshots", {
				checkpointId: args.checkpointId,
				filePath: snapshot.filePath,
				content: snapshot.content,
				hash: snapshot.hash,
				isDeleted: snapshot.isDeleted,
				permissions: snapshot.permissions,
				size: snapshot.size,
			});
			count += 1;
		}
		return { success: true, count };
	},
});
