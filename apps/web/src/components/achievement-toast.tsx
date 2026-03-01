"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Trophy } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function AchievementWatcher({ userId }: { userId: string }) {
	const achievements = useQuery(api.achievements.listByUser, { userId });
	const acknowledge = useMutation(api.achievements.acknowledge);
	const shownRef = useRef(new Set<string>());

	useEffect(() => {
		if (!achievements) {
			return;
		}

		for (const achievement of achievements) {
			if (
				achievement.unlockedAt &&
				!achievement.acknowledged &&
				!shownRef.current.has(achievement._id)
			) {
				shownRef.current.add(achievement._id);
				toast.success(`Achievement Unlocked: ${achievement.badgeName}`, {
					description: `Level ${achievement.badgeLevel} badge earned!`,
					icon: <Trophy className="h-5 w-5 text-yellow-500" />,
					duration: 5000,
				});
				acknowledge({ achievementId: achievement._id });
			}
		}
	}, [achievements, acknowledge]);

	return null;
}
