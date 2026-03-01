"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Send, Users } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function GroupChatPage() {
	const groupChats = useQuery(api.groupChats.list);
	const [selectedChatId, setSelectedChatId] = useState<Id<"groupChats"> | null>(
		null
	);

	const activeChatId = selectedChatId ?? groupChats?.[0]?._id ?? null;
	const messages = useQuery(
		api.groupChats.listMessages,
		activeChatId ? { groupChatId: activeChatId } : "skip"
	);
	const sendMessage = useMutation(api.groupChats.sendMessage);
	const [input, setInput] = useState("");

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!(input.trim() && activeChatId)) {
			return;
		}
		await sendMessage({
			groupChatId: activeChatId,
			from: "user",
			content: input.trim(),
		});
		setInput("");
	};

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Group Chat</h1>
			</header>
			<div className="grid flex-1 grid-cols-[250px_1fr]">
				<div className="space-y-2 border-r p-4">
					<h2 className="mb-2 font-medium text-sm">Chats</h2>
					{!groupChats || groupChats.length === 0 ? (
						<p className="text-muted-foreground text-sm">No group chats yet.</p>
					) : (
						groupChats.map((chat: { _id: string; name: string }) => (
							<Button
								className="w-full justify-start"
								key={chat._id}
								onClick={() => setSelectedChatId(chat._id)}
								variant={activeChatId === chat._id ? "default" : "ghost"}
							>
								<Users className="mr-2 h-4 w-4" />
								{chat.name}
							</Button>
						))
					)}
				</div>
				<div className="flex flex-col">
					{activeChatId ? (
						<>
							<ScrollArea className="flex-1 p-4">
								<div className="space-y-3">
									{messages?.map(
										(msg: {
											_id: string;
											from: string;
											content: string;
											isSynthesized?: boolean;
										}) => (
											<div
												className={`rounded-lg p-3 ${
													msg.from === "user"
														? "ml-8 bg-primary/10"
														: `mr-8 ${msg.isSynthesized ? "border bg-secondary/20" : "bg-muted/50"}`
												}`}
												key={msg._id}
											>
												<p className="mb-1 font-semibold text-xs">
													{msg.from}
													{msg.isSynthesized && (
														<Badge className="ml-2" variant="outline">
															Synthesized
														</Badge>
													)}
												</p>
												<p className="text-sm">{msg.content}</p>
											</div>
										)
									)}
								</div>
							</ScrollArea>
							<form className="flex gap-2 border-t p-4" onSubmit={handleSend}>
								<Input
									className="flex-1"
									onChange={(e) => setInput(e.target.value)}
									placeholder="Type a message..."
									value={input}
								/>
								<Button disabled={!input.trim()} size="icon" type="submit">
									<Send className="h-4 w-4" />
								</Button>
							</form>
						</>
					) : (
						<div className="flex flex-1 items-center justify-center">
							<p className="text-muted-foreground">
								Select a group chat to start.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
