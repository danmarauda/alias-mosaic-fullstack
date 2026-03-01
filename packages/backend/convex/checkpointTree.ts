import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const getTree = query({
	args: { conversationId: v.id("conversations") },
	handler: async (ctx, args) => {
		const checkpoints = await ctx.db
			.query("checkpoints")
			.withIndex("by_conversation", (q) =>
				q.eq("conversationId", args.conversationId)
			)
			.collect();

		const nodeMap = new Map<
			string,
			{
				id: string;
				parentId: string | null;
				children: string[];
				depth: number;
				checkpoint: (typeof checkpoints)[number];
			}
		>();

		for (const cp of checkpoints) {
			nodeMap.set(cp._id, {
				id: cp._id,
				parentId: cp.parentCheckpointId ?? null,
				children: [],
				depth: 0,
				checkpoint: cp,
			});
		}

		for (const node of nodeMap.values()) {
			if (node.parentId && nodeMap.has(node.parentId)) {
				nodeMap.get(node.parentId)!.children.push(node.id);
			}
		}

		const computeDepth = (nodeId: string, depth: number): void => {
			const node = nodeMap.get(nodeId);
			if (!node) {
				return;
			}
			node.depth = depth;
			for (const childId of node.children) {
				computeDepth(childId, depth + 1);
			}
		};

		for (const node of nodeMap.values()) {
			if (!node.parentId) {
				computeDepth(node.id, 0);
			}
		}

		return Array.from(nodeMap.values()).map(({ checkpoint, ...rest }) => ({
			...rest,
			description: checkpoint.description,
			messageIndex: checkpoint.messageIndex,
			timestamp: checkpoint.timestamp,
			trigger: checkpoint.metadata?.trigger,
		}));
	},
});

export const getPath = query({
	args: { checkpointId: v.id("checkpoints") },
	handler: async (ctx, args) => {
		const path: Doc<"checkpoints">[] = [];
		let currentId: Id<"checkpoints"> | undefined = args.checkpointId;

		while (currentId) {
			const cp: Doc<"checkpoints"> | null = await ctx.db.get(currentId);
			if (!cp) {
				break;
			}
			path.unshift(cp);
			currentId = cp.parentCheckpointId as Id<"checkpoints"> | undefined;
		}

		return path;
	},
});

export const getDiff = query({
	args: {
		checkpointA: v.id("checkpoints"),
		checkpointB: v.id("checkpoints"),
	},
	handler: async (ctx, args) => {
		const snapshotsA = await ctx.db
			.query("fileSnapshots")
			.withIndex("by_checkpoint", (q) => q.eq("checkpointId", args.checkpointA))
			.collect();

		const snapshotsB = await ctx.db
			.query("fileSnapshots")
			.withIndex("by_checkpoint", (q) => q.eq("checkpointId", args.checkpointB))
			.collect();

		const mapA = new Map(snapshotsA.map((s) => [s.filePath, s]));
		const mapB = new Map(snapshotsB.map((s) => [s.filePath, s]));

		const allPaths = new Set([...mapA.keys(), ...mapB.keys()]);
		const changes: Array<{
			filePath: string;
			type: "added" | "removed" | "modified";
		}> = [];

		for (const path of allPaths) {
			const a = mapA.get(path);
			const b = mapB.get(path);

			if (!a && b) {
				changes.push({ filePath: path, type: "added" as const });
			} else if (a && !b) {
				changes.push({ filePath: path, type: "removed" as const });
			} else if (a && b && a.hash !== b.hash) {
				changes.push({ filePath: path, type: "modified" as const });
			}
		}

		return changes;
	},
});
