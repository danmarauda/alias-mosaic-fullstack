"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Plug, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function MCPPage() {
	const servers = useQuery(api.mcpServers.list, {});
	const createServer = useMutation(api.mcpServers.create);
	const removeServer = useMutation(api.mcpServers.remove);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		name: "",
		transport: "stdio",
		command: "",
		url: "",
		scope: "local",
	});

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim()) {
			return;
		}
		await createServer({
			name: form.name.trim(),
			transport: form.transport,
			command: form.transport === "stdio" ? form.command : undefined,
			url: form.transport !== "stdio" ? form.url : undefined,
			scope: form.scope,
			importedFromClaudeDesktop: false,
		});
		setForm({
			name: "",
			transport: "stdio",
			command: "",
			url: "",
			scope: "local",
		});
		setOpen(false);
	};

	const statusColor = (status: string | undefined) => {
		if (status === "connected") {
			return "default" as const;
		}
		if (status === "error") {
			return "destructive" as const;
		}
		return "secondary" as const;
	};

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">MCP Servers</h1>
				<div className="ml-auto">
					<Dialog onOpenChange={setOpen} open={open}>
						<DialogTrigger render={<Button size="sm" />}>
							<Plus className="mr-2 h-4 w-4" />
							Add Server
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add MCP Server</DialogTitle>
							</DialogHeader>
							<form className="space-y-4" onSubmit={handleCreate}>
								<div className="space-y-2">
									<Label htmlFor="server-name">Name</Label>
									<Input
										id="server-name"
										onChange={(e) =>
											setForm((f) => ({ ...f, name: e.target.value }))
										}
										placeholder="my-server"
										value={form.name}
									/>
								</div>
								<div className="space-y-2">
									<Label>Transport</Label>
									<Select
										onValueChange={(v) =>
											setForm((f) => ({ ...f, transport: v }))
										}
										value={form.transport}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="stdio">stdio</SelectItem>
											<SelectItem value="sse">SSE</SelectItem>
											<SelectItem value="http">HTTP</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{form.transport === "stdio" ? (
									<div className="space-y-2">
										<Label htmlFor="server-command">Command</Label>
										<Input
											id="server-command"
											onChange={(e) =>
												setForm((f) => ({
													...f,
													command: e.target.value,
												}))
											}
											placeholder="npx my-mcp-server"
											value={form.command}
										/>
									</div>
								) : (
									<div className="space-y-2">
										<Label htmlFor="server-url">URL</Label>
										<Input
											id="server-url"
											onChange={(e) =>
												setForm((f) => ({ ...f, url: e.target.value }))
											}
											placeholder="https://..."
											value={form.url}
										/>
									</div>
								)}
								<Button className="w-full" type="submit">
									Add Server
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</header>
			<div className="flex-1 p-6">
				{!servers || servers.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<Plug className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">No MCP servers configured.</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{servers.map((server) => (
							<Card key={server._id}>
								<CardHeader className="flex flex-row items-start justify-between">
									<CardTitle className="flex items-center gap-2 text-base">
										<Plug className="h-4 w-4" />
										{server.name}
									</CardTitle>
									<Button
										onClick={() => removeServer({ serverId: server._id })}
										size="icon"
										variant="ghost"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-1.5">
										<Badge variant={statusColor(server.status)}>
											{server.status ?? "disconnected"}
										</Badge>
										<Badge variant="outline">{server.transport}</Badge>
										<Badge variant="secondary">{server.scope}</Badge>
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
