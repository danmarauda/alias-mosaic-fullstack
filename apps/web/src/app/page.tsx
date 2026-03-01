"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Bot, CheckSquare, MessageSquare, Timer } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardPage() {
	const healthCheck = useQuery(api.healthCheck.get);
	const agents = useQuery(api.agents.list);
	const projects = useQuery(api.projects.list);

	const stats = [
		{
			title: "Agents",
			value: agents?.length ?? 0,
			icon: Bot,
			href: "/agents",
		},
		{
			title: "Projects",
			value: projects?.length ?? 0,
			icon: CheckSquare,
			href: "/projects",
		},
	];

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Dashboard</h1>
				<div className="ml-auto flex items-center gap-2">
					<Badge variant={healthCheck === "OK" ? "default" : "destructive"}>
						{healthCheck === "OK" ? "Connected" : "Checking..."}
					</Badge>
				</div>
			</header>
			<div className="flex-1 space-y-6 p-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{stats.map((stat) => (
						<Card key={stat.title}>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="font-medium text-sm">
									{stat.title}
								</CardTitle>
								<stat.icon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">{stat.value}</div>
							</CardContent>
						</Card>
					))}
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-wrap gap-2">
							<Button render={<Link href="/ai" />} size="sm">
								<MessageSquare className="mr-2 h-4 w-4" />
								New Chat
							</Button>
							<Button
								render={<Link href="/agents" />}
								size="sm"
								variant="outline"
							>
								<Bot className="mr-2 h-4 w-4" />
								Manage Agents
							</Button>
							<Button
								render={<Link href="/checkpoints" />}
								size="sm"
								variant="outline"
							>
								<Timer className="mr-2 h-4 w-4" />
								Checkpoints
							</Button>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Recent Projects</CardTitle>
						</CardHeader>
						<CardContent>
							{!projects || projects.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No projects yet.
								</p>
							) : (
								<ul className="space-y-2">
									{projects.slice(0, 5).map((project) => (
										<li
											className="flex items-center justify-between text-sm"
											key={project._id}
										>
											<span>{project.name}</span>
											<Badge variant="secondary">{project.path}</Badge>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
