"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { CheckSquare, GripVertical, Plus } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const COLUMNS = [
	{ id: "backlog", label: "Backlog" },
	{ id: "todo", label: "Todo" },
	{ id: "in_progress", label: "In Progress" },
	{ id: "review", label: "Review" },
	{ id: "done", label: "Done" },
] as const;

const PRIORITIES = [
	{ value: "low", label: "Low", color: "secondary" },
	{ value: "medium", label: "Medium", color: "default" },
	{ value: "high", label: "High", color: "destructive" },
	{ value: "urgent", label: "Urgent", color: "destructive" },
] as const;

function DroppableColumn({
	label,
	tasks,
}: {
	columnId: string;
	label: string;
	tasks: Array<{
		_id: string;
		title: string;
		description?: string;
		priority: string;
		status: string;
	}>;
	onDrop?: (taskId: string, newStatus: string) => void;
}) {
	return (
		<div className="flex min-w-[250px] flex-col rounded-lg border bg-muted/30 p-3">
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-semibold text-sm">{label}</h3>
				<Badge variant="secondary">{tasks.length}</Badge>
			</div>
			<div className="flex-1 space-y-2">
				{tasks.map((task) => {
					const priorityConfig = PRIORITIES.find(
						(p) => p.value === task.priority
					);
					return (
						<Card
							className="cursor-grab active:cursor-grabbing"
							draggable
							key={task._id}
							onDragEnd={() => {
								/* noop — drop handled by column */
							}}
							onDragStart={(e) => {
								(e as unknown as DragEvent).dataTransfer?.setData(
									"taskId",
									task._id
								);
							}}
						>
							<CardContent className="p-3">
								<div className="flex items-start gap-2">
									<GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
									<div className="flex-1">
										<p className="font-medium text-sm">{task.title}</p>
										{task.description && (
											<p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
												{task.description}
											</p>
										)}
										<Badge
											className="mt-2"
											variant={
												(priorityConfig?.color as
													| "default"
													| "secondary"
													| "destructive") ?? "default"
											}
										>
											{task.priority}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

export default function TasksPage() {
	const tasks = useQuery(api.tasks.list);
	const createTask = useMutation(api.tasks.create);
	const updateStatus = useMutation(api.tasks.updateStatus);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		title: "",
		description: "",
		priority: "medium",
		status: "todo",
	});

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.title.trim()) {
			return;
		}
		const tasksInColumn = tasks?.filter((t) => t.status === form.status) ?? [];
		await createTask({
			title: form.title.trim(),
			description: form.description || undefined,
			priority: form.priority,
			status: form.status,
			order: tasksInColumn.length,
		});
		setForm({
			title: "",
			description: "",
			priority: "medium",
			status: "todo",
		});
		setOpen(false);
	};

	const handleDrop = async (taskId: string, newStatus: string) => {
		await updateStatus({ taskId: taskId as Id<"tasks">, status: newStatus });
	};

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Tasks</h1>
				<div className="ml-auto">
					<Dialog onOpenChange={setOpen} open={open}>
						<DialogTrigger render={<Button size="sm" />}>
							<Plus className="mr-2 h-4 w-4" />
							New Task
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create Task</DialogTitle>
							</DialogHeader>
							<form className="space-y-4" onSubmit={handleCreate}>
								<div className="space-y-2">
									<Label htmlFor="task-title">Title</Label>
									<Input
										id="task-title"
										onChange={(e) =>
											setForm((f) => ({
												...f,
												title: e.target.value,
											}))
										}
										value={form.title}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="task-desc">Description</Label>
									<Input
										id="task-desc"
										onChange={(e) =>
											setForm((f) => ({
												...f,
												description: e.target.value,
											}))
										}
										value={form.description}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Priority</Label>
										<Select
											onValueChange={(v) =>
												setForm((f) => ({
													...f,
													priority: v,
												}))
											}
											value={form.priority}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{PRIORITIES.map((p) => (
													<SelectItem key={p.value} value={p.value}>
														{p.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label>Column</Label>
										<Select
											onValueChange={(v) =>
												setForm((f) => ({
													...f,
													status: v,
												}))
											}
											value={form.status}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{COLUMNS.map((c) => (
													<SelectItem key={c.id} value={c.id}>
														{c.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
								<Button className="w-full" type="submit">
									Create Task
								</Button>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</header>
			<div className="flex-1 overflow-x-auto p-6">
				{tasks ? (
					<div className="flex gap-4">
						{COLUMNS.map((col) => {
							const columnTasks = tasks.filter((t) => t.status === col.id);
							return (
								<DroppableColumn
									columnId={col.id}
									key={col.id}
									label={col.label}
									onDrop={handleDrop}
									tasks={columnTasks}
								/>
							);
						})}
					</div>
				) : (
					<div className="flex items-center justify-center py-12">
						<CheckSquare className="mr-2 h-5 w-5 text-muted-foreground" />
						<span className="text-muted-foreground">Loading tasks...</span>
					</div>
				)}
			</div>
		</div>
	);
}
