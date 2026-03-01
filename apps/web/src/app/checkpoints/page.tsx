"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { GitBranch, Timer } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function CheckpointsPage() {
	const projects = useQuery(api.projects.list);
	const [selectedProjectId, setSelectedProjectId] =
		useState<Id<"projects"> | null>(null);

	const activeProjectId = selectedProjectId ?? projects?.[0]?._id ?? null;
	const conversations = useQuery(
		api.conversations.listByProject,
		activeProjectId ? { projectId: activeProjectId } : "skip"
	);

	const firstConvId = conversations?.[0]?._id ?? null;
	const checkpoints = useQuery(
		api.checkpoints.listByConversation,
		firstConvId ? { conversationId: firstConvId } : "skip"
	);

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Checkpoints</h1>
			</header>
			<div className="flex-1 p-6">
				<div className="mb-4 flex flex-wrap gap-2">
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

				{!checkpoints || checkpoints.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<Timer className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">No checkpoints yet.</p>
					</div>
				) : (
					<div className="space-y-4">
						{checkpoints.map((cp) => (
							<Card key={cp._id}>
								<CardHeader className="flex flex-row items-center gap-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-full border">
										<GitBranch className="h-5 w-5" />
									</div>
									<div className="flex-1">
										<CardTitle className="text-base">
											{cp.description ?? `Checkpoint #${cp.messageIndex}`}
										</CardTitle>
										<p className="text-muted-foreground text-sm">
											{new Date(cp.timestamp).toLocaleString()}
										</p>
									</div>
									<Badge>{cp.metadata?.trigger ?? "manual"}</Badge>
								</CardHeader>
								{cp.metadata && (
									<CardContent>
										<div className="flex flex-wrap gap-1.5">
											{cp.metadata.filesModified.map((file) => (
												<Badge key={file} variant="outline">
													{file}
												</Badge>
											))}
										</div>
									</CardContent>
								)}
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
