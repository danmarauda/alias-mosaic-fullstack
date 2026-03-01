"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Bot, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AgentsPage() {
	const agents = useQuery(api.agents.list);
	const createAgent = useMutation(api.agents.create);
	const removeAgent = useMutation(api.agents.remove);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		name: "",
		icon: "bot",
		systemPrompt: "",
		model: "gemini-2.5-flash",
		enableFileRead: true,
		enableFileWrite: false,
		enableNetwork: false,
	});

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!(form.name.trim() && form.systemPrompt.trim())) {
			return;
		}
		await createAgent(form);
		setForm({
			name: "",
			icon: "bot",
			systemPrompt: "",
			model: "gemini-2.5-flash",
			enableFileRead: true,
			enableFileWrite: false,
			enableNetwork: false,
		});
		setOpen(false);
	};

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Agents</h1>
				<div className="ml-auto">
					<Dialog onOpenChange={setOpen} open={open}>
						<DialogTrigger render={<Button size="sm" />}>
							<Plus className="mr-2 h-4 w-4" />
							New Agent
						</DialogTrigger>
						<DialogContent className="max-w-lg">
							<DialogHeader>
								<DialogTitle>Create Agent</DialogTitle>
							</DialogHeader>
							<form className="space-y-4" onSubmit={handleCreate}>
								<div className="space-y-2">
									<Label htmlFor="agent-name">Name</Label>
									<Input
										id="agent-name"
										onChange={(e) =>
											setForm((f) => ({ ...f, name: e.target.value }))
										}
										placeholder="Code Reviewer"
										value={form.name}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="agent-model">Model</Label>
									<Select
										onValueChange={(v) => setForm((f) => ({ ...f, model: v }))}
										value={form.model}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="gemini-2.5-flash">
												Gemini 2.5 Flash
											</SelectItem>
											<SelectItem value="gpt-4o">GPT-4o</SelectItem>
											<SelectItem value="claude-sonnet-4-20250514">
												Claude Sonnet
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="agent-prompt">System Prompt</Label>
									<Textarea
										id="agent-prompt"
										onChange={(e) =>
											setForm((f) => ({
												...f,
												systemPrompt: e.target.value,
											}))
										}
										placeholder="You are a helpful..."
										rows={4}
										value={form.systemPrompt}
									/>
								</div>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label htmlFor="file-read">File Read</Label>
										<Switch
											checked={form.enableFileRead}
											id="file-read"
											onCheckedChange={(c) =>
												setForm((f) => ({ ...f, enableFileRead: c }))
											}
										/>
									</div>
									<div className="flex items-center justify-between">
										<Label htmlFor="file-write">File Write</Label>
										<Switch
											checked={form.enableFileWrite}
											id="file-write"
											onCheckedChange={(c) =>
												setForm((f) => ({ ...f, enableFileWrite: c }))
											}
										/>
									</div>
									<div className="flex items-center justify-between">
										<Label htmlFor="network">Network</Label>
										<Switch
											checked={form.enableNetwork}
											id="network"
											onCheckedChange={(c) =>
												setForm((f) => ({ ...f, enableNetwork: c }))
											}
										/>
									</div>
								</div>
								<Button className="w-full" type="submit">
									Create Agent
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</header>
			<div className="flex-1 p-6">
				{!agents || agents.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<Bot className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							No agents yet. Create one to get started.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{agents.map((agent) => (
							<Card key={agent._id}>
								<CardHeader className="flex flex-row items-start justify-between">
									<CardTitle className="flex items-center gap-2 text-base">
										<Bot className="h-4 w-4" />
										{agent.name}
									</CardTitle>
									<Button
										onClick={() => removeAgent({ agentId: agent._id })}
										size="icon"
										variant="ghost"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</CardHeader>
								<CardContent>
									<p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
										{agent.systemPrompt}
									</p>
									<div className="flex flex-wrap gap-1.5">
										<Badge>{agent.model}</Badge>
										{agent.enableFileRead && (
											<Badge variant="outline">Read</Badge>
										)}
										{agent.enableFileWrite && (
											<Badge variant="outline">Write</Badge>
										)}
										{agent.enableNetwork && (
											<Badge variant="outline">Network</Badge>
										)}
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
