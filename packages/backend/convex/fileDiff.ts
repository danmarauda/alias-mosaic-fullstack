import { v } from "convex/values";

import { query } from "./_generated/server";

export const computeLineDiff = query({
	args: {
		oldContent: v.string(),
		newContent: v.string(),
	},
	handler: (_ctx, args) => {
		const oldLines = args.oldContent.split("\n");
		const newLines = args.newContent.split("\n");

		const hunks: Array<{
			oldStart: number;
			oldEnd: number;
			newStart: number;
			newEnd: number;
			removedLines: string[];
			addedLines: string[];
		}> = [];
		let i = 0;
		let j = 0;

		while (i < oldLines.length || j < newLines.length) {
			if (
				i < oldLines.length &&
				j < newLines.length &&
				oldLines[i] === newLines[j]
			) {
				i++;
				j++;
				continue;
			}

			const hunkStart = { old: i, new: j };
			while (
				i < oldLines.length &&
				(j >= newLines.length || oldLines[i] !== newLines[j])
			) {
				i++;
			}
			while (
				j < newLines.length &&
				(i >= oldLines.length || oldLines[i] !== newLines[j])
			) {
				j++;
			}

			hunks.push({
				oldStart: hunkStart.old,
				oldEnd: i,
				newStart: hunkStart.new,
				newEnd: j,
				removedLines: oldLines.slice(hunkStart.old, i),
				addedLines: newLines.slice(hunkStart.new, j),
			});
		}

		return {
			hunks,
			totalAdded: hunks.reduce((sum, h) => sum + h.addedLines.length, 0),
			totalRemoved: hunks.reduce((sum, h) => sum + h.removedLines.length, 0),
		};
	},
});

export const getDiffBetweenCheckpoints = query({
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
		const diffs = [];

		for (const filePath of allPaths) {
			const a = mapA.get(filePath);
			const b = mapB.get(filePath);

			if (!a && b) {
				diffs.push({
					filePath,
					type: "added" as const,
					linesAdded: b.content.split("\n").length,
					linesRemoved: 0,
				});
			} else if (a && !b) {
				diffs.push({
					filePath,
					type: "removed" as const,
					linesAdded: 0,
					linesRemoved: a.content.split("\n").length,
				});
			} else if (a && b && a.hash !== b.hash) {
				const oldLines = a.content.split("\n");
				const newLines = b.content.split("\n");
				diffs.push({
					filePath,
					type: "modified" as const,
					linesAdded: Math.max(0, newLines.length - oldLines.length),
					linesRemoved: Math.max(0, oldLines.length - newLines.length),
				});
			}
		}

		return diffs;
	},
});
