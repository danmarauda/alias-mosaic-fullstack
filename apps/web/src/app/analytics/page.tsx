"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { LineChart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AnalyticsPage() {
	const projects = useQuery(api.projects.list);
	const [selectedProjectId, setSelectedProjectId] =
		useState<Id<"projects"> | null>(null);

	const activeProjectId = selectedProjectId ?? projects?.[0]?._id ?? null;
	const totals = useQuery(
		api.usageStats.getTotalByProject,
		activeProjectId ? { projectId: activeProjectId } : "skip"
	);

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Analytics</h1>
			</header>
			<div className="flex-1 p-6">
				<div className="mb-6 flex flex-wrap gap-2">
					{projects?.map((project) => (
						<Button
							key={project._id}
							onClick={() => setSelectedProjectId(project._id)}
							size="sm"
							variant={activeProjectId === project._id ? "default" : "outline"}
						>
							{project.name}
						</Button>
					))}
				</div>

				{totals ? (
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="font-medium text-sm">
									Input Tokens
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">
									{totals.totalInputTokens.toLocaleString()}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="font-medium text-sm">
									Output Tokens
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">
									{totals.totalOutputTokens.toLocaleString()}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="font-medium text-sm">
									Total Cost
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">
									${totals.totalCostUsd.toFixed(4)}
								</div>
							</CardContent>
						</Card>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-12">
						<LineChart className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							Select a project to view analytics.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
