"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Flag, Plus } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";

const STATUS_COLORS: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	planned: "secondary",
	in_progress: "default",
	completed: "outline",
	blocked: "destructive",
};

export default function RoadmapPage() {
	const projects = useQuery(api.projects.list);
	const [selectedProjectId, setSelectedProjectId] =
		useState<Id<"projects"> | null>(null);

	const activeProjectId = selectedProjectId ?? projects?.[0]?._id ?? null;
	const phases = useQuery(
		api.roadmapPhases.listByProject,
		activeProjectId ? { projectId: activeProjectId } : "skip"
	);
	const createPhase = useMutation(api.roadmapPhases.create);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ name: "", description: "" });

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!(form.name.trim() && activeProjectId)) {
			return;
		}
		const nextOrder = (phases?.length ?? 0) + 1;
		await createPhase({
			name: form.name.trim(),
			description: form.description || undefined,
			order: nextOrder,
			projectId: activeProjectId,
		});
		setForm({ name: "", description: "" });
		setOpen(false);
	};

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Roadmap</h1>
				<div className="ml-auto">
					<Dialog onOpenChange={setOpen} open={open}>
						<DialogTrigger
							render={<Button disabled={!activeProjectId} size="sm" />}
						>
							<Plus className="mr-2 h-4 w-4" />
							Add Phase
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add Roadmap Phase</DialogTitle>
							</DialogHeader>
							<form className="space-y-4" onSubmit={handleCreate}>
								<div className="space-y-2">
									<Label htmlFor="phase-name">Phase Name</Label>
									<Input
										id="phase-name"
										onChange={(e) =>
											setForm((f) => ({
												...f,
												name: e.target.value,
											}))
										}
										value={form.name}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="phase-desc">Description</Label>
									<Input
										id="phase-desc"
										onChange={(e) =>
											setForm((f) => ({
												...f,
												description: e.target.value,
											}))
										}
										value={form.description}
									/>
								</div>
								<Button className="w-full" type="submit">
									Add Phase
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>
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

				{!phases || phases.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<Flag className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">No roadmap phases yet.</p>
					</div>
				) : (
					<div className="space-y-4">
						{phases.map((phase, idx) => {
							const progress =
								phase.taskCount && phase.taskCount > 0
									? ((phase.completedTaskCount ?? 0) / phase.taskCount) * 100
									: 0;
							return (
								<Card key={phase._id}>
									<CardHeader className="flex flex-row items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-full border font-bold text-sm">
											{idx + 1}
										</div>
										<div className="flex-1">
											<CardTitle className="text-base">{phase.name}</CardTitle>
											{phase.description && (
												<p className="text-muted-foreground text-sm">
													{phase.description}
												</p>
											)}
										</div>
										<Badge variant={STATUS_COLORS[phase.status] ?? "secondary"}>
											{phase.status}
										</Badge>
									</CardHeader>
									<CardContent>
										<div className="flex items-center gap-4">
											<Progress className="flex-1" value={progress} />
											<span className="text-muted-foreground text-sm">
												{phase.completedTaskCount ?? 0}/{phase.taskCount ?? 0}{" "}
												tasks
											</span>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
