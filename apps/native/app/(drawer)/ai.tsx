import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import {
	type UIMessage,
	useSmoothText,
	useUIMessages,
} from "@convex-dev/agent/react";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import {
	Button,
	Input,
	Spinner,
	Surface,
	TextField,
	useThemeColor,
} from "heroui-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	View,
} from "react-native";

import { Container } from "@/components/container";

function MessageContent({
	text,
	isStreaming,
}: {
	text: string;
	isStreaming: boolean;
}) {
	const [visibleText] = useSmoothText(text, {
		startStreaming: isStreaming,
	});
	return (
		<Text className="text-foreground text-sm leading-relaxed">
			{visibleText}
		</Text>
	);
}

export default function AIScreen() {
	const [input, setInput] = useState("");
	const [selectedProjectId, setSelectedProjectId] =
		useState<Id<"projects"> | null>(null);
	const [selectedConversationId, setSelectedConversationId] =
		useState<Id<"conversations"> | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");

	const projects = useQuery(api.projects.list);
	const firstProjectId = useMemo(() => projects?.[0]?._id ?? null, [projects]);
	const activeProjectId = selectedProjectId ?? firstProjectId;
	const conversations = useQuery(
		api.conversations.listByProject,
		activeProjectId ? { projectId: activeProjectId } : "skip"
	);
	const firstConversationId = useMemo(
		() => conversations?.[0]?._id ?? null,
		[conversations]
	);
	const activeConversationId = selectedConversationId ?? firstConversationId;
	const activeConversation = useQuery(
		api.conversations.getById,
		activeConversationId ? { conversationId: activeConversationId } : "skip"
	);

	const threadId =
		activeConversation?.aiTabs.find(
			(tab) => tab.id === activeConversation.activeAITabId
		)?.agentSessionId ?? null;

	const createProject = useMutation(api.projects.create);
	const createConversation = useMutation(api.conversations.create);
	const upsertThreadTab = useMutation(api.conversations.upsertThreadTab);
	const createThread = useMutation(api.chat.createNewThread);
	const sendMessage = useMutation(api.chat.sendMessage);

	const { results: messages } = useUIMessages(
		api.chat.listMessages,
		threadId ? { threadId } : "skip",
		{ initialNumItems: 50, stream: true }
	);

	const hasStreamingMessage = messages?.some(
		(m: UIMessage) => m.status === "streaming"
	);

	useEffect(() => {
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, [messages]);

	const onSubmit = async () => {
		const value = input.trim();
		if (!value || isLoading) return;

		setIsLoading(true);
		setInput("");

		try {
			let projectId = activeProjectId;
			if (!projectId) {
				const project = await createProject({
					name: "Default Project",
					path: ".",
				});
				projectId = project?._id ?? null;
			}

			if (!projectId) {
				throw new Error("Failed to create project");
			}

			let conversationId = activeConversationId;
			if (!conversationId) {
				const conversation = await createConversation({
					projectId,
					name: "Main Conversation",
					firstMessage: value,
				});
				conversationId = conversation?._id ?? null;
				if (conversationId) {
					setSelectedConversationId(conversationId);
				}
			}

			if (!conversationId) {
				throw new Error("Failed to create conversation");
			}

			let currentThreadId = threadId;
			if (!currentThreadId) {
				currentThreadId = await createThread();
				await upsertThreadTab({
					conversationId,
					tabId: "tab-main",
					tabName: "Main",
					threadId: currentThreadId,
				});
			}

			await sendMessage({ threadId: currentThreadId, prompt: value });
		} catch (error) {
			console.error("Failed to send message:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<View className="flex-1 px-4 py-4">
					<View className="mb-4 py-4">
						<Text className="font-semibold text-2xl text-foreground tracking-tight">
							AI Chat
						</Text>
						<Text className="mt-1 text-muted text-sm">
							Chat with our AI assistant
						</Text>
						<View className="mt-2 flex-row flex-wrap gap-2">
							{projects?.map((project) => (
								<Button
									key={project._id}
									onPress={() => {
										setSelectedProjectId(project._id);
										setSelectedConversationId(null);
									}}
									size="sm"
									variant={
										activeProjectId === project._id ? "primary" : "secondary"
									}
								>
									<Button.Label>{project.name}</Button.Label>
								</Button>
							))}
						</View>
						<View className="mt-2 flex-row flex-wrap gap-2">
							{conversations?.map((conversation) => (
								<Button
									key={conversation._id}
									onPress={() => setSelectedConversationId(conversation._id)}
									size="sm"
									variant={
										activeConversationId === conversation._id
											? "primary"
											: "secondary"
									}
								>
									<Button.Label>{conversation.name ?? "Untitled"}</Button.Label>
								</Button>
							))}
						</View>
					</View>

					<ScrollView
						className="mb-4 flex-1"
						ref={scrollViewRef}
						showsVerticalScrollIndicator={false}
					>
						{!messages || messages.length === 0 ? (
							<View className="flex-1 items-center justify-center py-10">
								<Ionicons
									color={mutedColor}
									name="chatbubble-ellipses-outline"
									size={32}
								/>
								<Text className="mt-3 text-muted text-sm">
									Ask me anything to get started
								</Text>
							</View>
						) : (
							<View className="gap-2">
								{messages.map((message: UIMessage) => (
									<Surface
										className={`rounded-lg p-3 ${message.role === "user" ? "ml-10" : "mr-10"}`}
										key={message.key}
										variant={message.role === "user" ? "tertiary" : "secondary"}
									>
										<Text className="mb-1 font-medium text-muted text-xs">
											{message.role === "user" ? "You" : "AI"}
										</Text>
										<MessageContent
											isStreaming={message.status === "streaming"}
											text={message.text ?? ""}
										/>
									</Surface>
								))}
								{isLoading && !hasStreamingMessage && (
									<Surface className="mr-10 rounded-lg p-3" variant="secondary">
										<Text className="mb-1 font-medium text-muted text-xs">
											AI
										</Text>
										<View className="flex-row items-center gap-2">
											<Spinner size="sm" />
											<Text className="text-muted text-sm">Thinking...</Text>
										</View>
									</Surface>
								)}
							</View>
						)}
					</ScrollView>

					<View className="mb-3 h-px bg-muted" />

					<View className="flex-row items-center gap-2">
						<View className="flex-1">
							<TextField>
								<Input
									autoFocus
									editable={!isLoading}
									onChangeText={setInput}
									onSubmitEditing={onSubmit}
									placeholder="Type a message..."
									value={input}
								/>
							</TextField>
						</View>
						<Button
							isDisabled={!input.trim() || isLoading}
							isIconOnly
							onPress={onSubmit}
							size="sm"
							variant={input.trim() && !isLoading ? "primary" : "secondary"}
						>
							<Ionicons
								color={
									input.trim() && !isLoading ? foregroundColor : mutedColor
								}
								name="arrow-up"
								size={18}
							/>
						</Button>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Container>
	);
}
