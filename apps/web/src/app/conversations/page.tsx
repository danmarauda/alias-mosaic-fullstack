"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ConversationsPage() {
	const projects = useQuery(api.projects.list);
	const [selectedProjectId, setSelectedProjectId] =
		useState<Id<"projects"> | null>(null);

	const activeProjectId = selectedProjectId ?? projects?.[0]?._id ?? null;
	const conversations = useQuery(
		api.conversations.listByProject,
		activeProjectId ? { projectId: activeProjectId } : "skip"
	);

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Conversations</h1>
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

				{!conversations || conversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">No conversations yet.</p>
						<Button className="mt-4" render={<Link href="/ai" />} size="sm">
							<MessageSquare className="mr-2 h-4 w-4" />
							Start a Chat
						</Button>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{conversations.map((conv) => (
							<Card key={conv._id}>
								<CardHeader>
									<CardTitle className="text-base">
										{conv.name ?? "Untitled Conversation"}
									</CardTitle>
								</CardHeader>
								<CardContent>
									{conv.firstMessage && (
										<p className="mb-2 line-clamp-2 text-muted-foreground text-sm">
											{conv.firstMessage}
										</p>
									)}
									<div className="flex items-center gap-2">
										<Badge variant="secondary">
											{conv.aiTabs.length} tab
											{conv.aiTabs.length !== 1 ? "s" : ""}
										</Badge>
										<Badge variant="outline">{conv.checkpointStrategy}</Badge>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
