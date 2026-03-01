"use client";

import {
	Bot,
	CheckSquare,
	FileText,
	Flag,
	FolderOpen,
	GitBranch,
	LayoutDashboard,
	LineChart,
	MessageSquare,
	Play,
	Plug,
	Settings,
	Timer,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";

const mainNav = [
	{ title: "Dashboard", href: "/", icon: LayoutDashboard },
	{ title: "AI Chat", href: "/ai", icon: MessageSquare },
	{ title: "Projects", href: "/projects", icon: FolderOpen },
] as const;

const agentNav = [
	{ title: "Agents", href: "/agents", icon: Bot },
	{ title: "Conversations", href: "/conversations", icon: FileText },
	{ title: "Group Chat", href: "/group-chat", icon: Users },
] as const;

const workflowNav = [
	{ title: "Playbooks", href: "/playbooks", icon: Play },
	{ title: "Tasks", href: "/tasks", icon: CheckSquare },
	{ title: "Roadmap", href: "/roadmap", icon: Flag },
	{ title: "Checkpoints", href: "/checkpoints", icon: Timer },
] as const;

const systemNav = [
	{ title: "MCP Servers", href: "/mcp", icon: Plug },
	{ title: "Analytics", href: "/analytics", icon: LineChart },
	{ title: "Settings", href: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
	const pathname = usePathname();

	const renderNavGroup = (
		label: string,
		items: ReadonlyArray<{
			title: string;
			href: string;
			icon: React.ComponentType<{ className?: string }>;
		}>
	) => (
		<SidebarGroup>
			<SidebarGroupLabel>{label}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.href}>
							<SidebarMenuButton
								isActive={
									item.href === "/"
										? pathname === "/"
										: pathname.startsWith(item.href)
								}
								render={<Link href={item.href as string & {}} />}
							>
								<item.icon className="h-4 w-4" />
								<span>{item.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-1.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
						<GitBranch className="h-4 w-4" />
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-sm">MOSAIC</span>
						<span className="text-muted-foreground text-xs">AI Platform</span>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				{renderNavGroup("Main", mainNav)}
				{renderNavGroup("Agents", agentNav)}
				{renderNavGroup("Workflows", workflowNav)}
				{renderNavGroup("System", systemNav)}
			</SidebarContent>
			<SidebarFooter>
				<div className="flex items-center justify-between px-2 py-1.5">
					<ModeToggle />
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
