"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TodosPage() {
	const todos = useQuery(api.todos.getAll);
	const createTodo = useMutation(api.todos.create);
	const toggleTodo = useMutation(api.todos.toggle);
	const deleteTodo = useMutation(api.todos.deleteTodo);
	const [text, setText] = useState("");

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim()) {
			return;
		}
		await createTodo({ text: text.trim() });
		setText("");
	};

	const completedCount = todos?.filter((t) => t.completed).length ?? 0;
	const totalCount = todos?.length ?? 0;

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Todos</h1>
				<Badge variant="secondary">
					{completedCount}/{totalCount}
				</Badge>
			</header>
			<div className="flex-1 p-6">
				<form className="mb-6 flex gap-2" onSubmit={handleAdd}>
					<Input
						className="flex-1"
						onChange={(e) => setText(e.target.value)}
						placeholder="Add a new todo..."
						value={text}
					/>
					<Button disabled={!text.trim()} size="icon" type="submit">
						<Plus className="h-4 w-4" />
					</Button>
				</form>

				{!todos || todos.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<CheckSquare className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground">No todos yet.</p>
					</div>
				) : (
					<ul className="space-y-2">
						{todos.map((todo) => (
							<li
								className="flex items-center gap-3 rounded-lg border p-3"
								key={todo._id}
							>
								<Checkbox
									checked={todo.completed}
									onCheckedChange={(checked) =>
										toggleTodo({
											id: todo._id,
											completed: checked === true,
										})
									}
								/>
								<span
									className={`flex-1 ${todo.completed ? "text-muted-foreground line-through" : ""}`}
								>
									{todo.text}
								</span>
								<Button
									onClick={() => deleteTodo({ id: todo._id })}
									size="icon"
									variant="ghost"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
