"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
	Bot,
	CheckSquare,
	FileText,
	FolderOpen,
	LayoutDashboard,
	LineChart,
	MessageSquare,
	Play,
	Plug,
	Settings,
	Timer,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";

const pages = [
	{ name: "Dashboard", href: "/", icon: LayoutDashboard },
	{ name: "AI Chat", href: "/ai", icon: MessageSquare },
	{ name: "Projects", href: "/projects", icon: FolderOpen },
	{ name: "Agents", href: "/agents", icon: Bot },
	{ name: "Conversations", href: "/conversations", icon: FileText },
	{ name: "Group Chat", href: "/group-chat", icon: Users },
	{ name: "Playbooks", href: "/playbooks", icon: Play },
	{ name: "Tasks", href: "/tasks", icon: CheckSquare },
	{ name: "Checkpoints", href: "/checkpoints", icon: Timer },
	{ name: "MCP Servers", href: "/mcp", icon: Plug },
	{ name: "Analytics", href: "/analytics", icon: LineChart },
	{ name: "Settings", href: "/settings", icon: Settings },
] as const;

export function CommandPalette() {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const agents = useQuery(api.agents.list);
	const projects = useQuery(api.projects.list);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const navigate = (href: string) => {
		setOpen(false);
		router.push(href as string & {});
	};

	return (
		<CommandDialog onOpenChange={setOpen} open={open}>
			<CommandInput placeholder="Search pages, agents, projects..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Pages">
					{pages.map((page) => (
						<CommandItem key={page.href} onSelect={() => navigate(page.href)}>
							<page.icon className="mr-2 h-4 w-4" />
							{page.name}
						</CommandItem>
					))}
				</CommandGroup>
				{agents && agents.length > 0 && (
					<>
						<CommandSeparator />
						<CommandGroup heading="Agents">
							{agents.map((agent) => (
								<CommandItem
									key={agent._id}
									onSelect={() => navigate("/agents")}
								>
									<Bot className="mr-2 h-4 w-4" />
									{agent.name}
								</CommandItem>
							))}
						</CommandGroup>
					</>
				)}
				{projects && projects.length > 0 && (
					<>
						<CommandSeparator />
						<CommandGroup heading="Projects">
							{projects.map((project) => (
								<CommandItem
									key={project._id}
									onSelect={() => navigate("/projects")}
								>
									<FolderOpen className="mr-2 h-4 w-4" />
									{project.name}
								</CommandItem>
							))}
						</CommandGroup>
					</>
				)}
			</CommandList>
		</CommandDialog>
	);
}
