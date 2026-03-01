"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { FolderOpen, Plus } from "lucide-react";
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

export default function ProjectsPage() {
	const projects = useQuery(api.projects.list);
	const createProject = useMutation(api.projects.create);
	const [name, setName] = useState("");
	const [path, setPath] = useState("");
	const [open, setOpen] = useState(false);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!(name.trim() && path.trim())) {
			return;
		}
		await createProject({ name: name.trim(), path: path.trim() });
		setName("");
		setPath("");
		setOpen(false);
	};

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Projects</h1>
				<div className="ml-auto">
					<Dialog onOpenChange={setOpen} open={open}>
						<DialogTrigger render={<Button size="sm" />}>
							<Plus className="mr-2 h-4 w-4" />
							New Project
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create Project</DialogTitle>
							</DialogHeader>
							<form className="space-y-4" onSubmit={handleCreate}>
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										onChange={(e) => setName(e.target.value)}
										placeholder="My Project"
										value={name}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="path">Path</Label>
									<Input
										id="path"
										onChange={(e) => setPath(e.target.value)}
										placeholder="/path/to/project"
										value={path}
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
				{!projects || projects.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							No projects yet. Create one to get started.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{projects.map((project) => (
							<Card key={project._id}>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<FolderOpen className="h-4 w-4" />
										{project.name}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="mb-2 text-muted-foreground text-sm">
										{project.path}
									</p>
									<div className="flex gap-2">
										{project.gitBranch && (
											<Badge variant="secondary">{project.gitBranch}</Badge>
										)}
										{project.worktreeEnabled && (
											<Badge variant="outline">Worktree</Badge>
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
