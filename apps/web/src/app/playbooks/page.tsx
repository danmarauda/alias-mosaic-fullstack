"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Play, Plus, Trash2 } from "lucide-react";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";

export default function PlaybooksPage() {
	const playbooks = useQuery(api.playbooks.list);
	const createPlaybook = useMutation(api.playbooks.create);
	const removePlaybook = useMutation(api.playbooks.remove);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		name: "",
		description: "",
		customPrompt: "",
	});

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim()) {
			return;
		}
		await createPlaybook({
			name: form.name.trim(),
			description: form.description || undefined,
			customPrompt: form.customPrompt || "{{project.name}}",
			documents: [],
			enableLoop: false,
			enableReset: false,
			worktreeEnabled: false,
		});
		setForm({ name: "", description: "", customPrompt: "" });
		setOpen(false);
	};

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Playbooks</h1>
				<div className="ml-auto">
					<Dialog onOpenChange={setOpen} open={open}>
						<DialogTrigger render={<Button size="sm" />}>
							<Plus className="mr-2 h-4 w-4" />
							New Playbook
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create Playbook</DialogTitle>
							</DialogHeader>
							<form className="space-y-4" onSubmit={handleCreate}>
								<div className="space-y-2">
									<Label htmlFor="pb-name">Name</Label>
									<Input
										id="pb-name"
										onChange={(e) =>
											setForm((f) => ({ ...f, name: e.target.value }))
										}
										value={form.name}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="pb-desc">Description</Label>
									<Input
										id="pb-desc"
										onChange={(e) =>
											setForm((f) => ({
												...f,
												description: e.target.value,
											}))
										}
										value={form.description}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="pb-prompt">Custom Prompt</Label>
									<Textarea
										id="pb-prompt"
										onChange={(e) =>
											setForm((f) => ({
												...f,
												customPrompt: e.target.value,
											}))
										}
										rows={3}
										value={form.customPrompt}
									/>
								</div>
								<Button className="w-full" type="submit">
									Create
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</header>
			<div className="flex-1 p-6">
				{!playbooks || playbooks.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<Play className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">No playbooks yet.</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{playbooks.map((pb) => (
							<Card key={pb._id}>
								<CardHeader className="flex flex-row items-start justify-between">
									<CardTitle className="flex items-center gap-2 text-base">
										<Play className="h-4 w-4" />
										{pb.name}
									</CardTitle>
									<Button
										onClick={() => removePlaybook({ playbookId: pb._id })}
										size="icon"
										variant="ghost"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</CardHeader>
								<CardContent>
									{pb.description && (
										<p className="mb-2 text-muted-foreground text-sm">
											{pb.description}
										</p>
									)}
									<div className="flex gap-1.5">
										<Badge variant="outline">
											{pb.documents.length} doc
											{pb.documents.length !== 1 ? "s" : ""}
										</Badge>
										{pb.enableLoop && <Badge>Loop</Badge>}
										{pb.worktreeEnabled && (
											<Badge variant="secondary">Worktree</Badge>
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
