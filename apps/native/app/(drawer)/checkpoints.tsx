import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Button, Input, Surface, TextField } from "heroui-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

export default function CheckpointsScreen() {
	const projects = useQuery(api.projects.list);
	const firstProjectId = useMemo(() => projects?.[0]?._id ?? null, [projects]);
	const [selectedProjectId, setSelectedProjectId] =
		useState<Id<"projects"> | null>(null);
	const activeProjectId = selectedProjectId ?? firstProjectId;
	const conversations = useQuery(
		api.conversations.listByProject,
		activeProjectId ? { projectId: activeProjectId } : "skip"
	);
	const firstConversationId = useMemo(
		() => conversations?.[0]?._id ?? null,
		[conversations]
	);
	const [selectedConversationId, setSelectedConversationId] =
		useState<Id<"conversations"> | null>(null);
	const activeConversationId = selectedConversationId ?? firstConversationId;
	const checkpoints = useQuery(
		api.checkpoints.listByConversation,
		activeConversationId ? { conversationId: activeConversationId } : "skip"
	);

	const createCheckpoint = useMutation(api.checkpoints.create);
	const [messageIndex, setMessageIndex] = useState("0");

	const onCreate = async () => {
		if (!(activeProjectId && activeConversationId)) {
			return;
		}
		await createCheckpoint({
			projectId: activeProjectId,
			conversationId: activeConversationId,
			messageIndex: Number.parseInt(messageIndex, 10) || 0,
			trigger: "manual",
			toolsUsed: [],
			filesModified: [],
		});
	};

	return (
		<Container>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 8 }}
			>
				<Surface className="gap-2 rounded-lg p-3" variant="secondary">
					<Text className="font-semibold text-foreground text-lg">
						Checkpoints
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{projects?.map((project) => (
							<Button
								key={project._id}
								onPress={() => {
									setSelectedProjectId(project._id);
									setSelectedConversationId(null);
								}}
								size="sm"
								variant={
									(selectedProjectId ?? firstProjectId) === project._id
										? "primary"
										: "secondary"
								}
							>
								<Button.Label>{project.name}</Button.Label>
							</Button>
						))}
					</View>
					<View className="flex-row flex-wrap gap-2">
						{conversations?.map((conversation) => (
							<Button
								key={conversation._id}
								onPress={() => setSelectedConversationId(conversation._id)}
								size="sm"
								variant={
									(selectedConversationId ?? firstConversationId) ===
									conversation._id
										? "primary"
										: "secondary"
								}
							>
								<Button.Label>{conversation.name ?? "Untitled"}</Button.Label>
							</Button>
						))}
					</View>
					<TextField>
						<Input
							onChangeText={setMessageIndex}
							placeholder="Message index"
							value={messageIndex}
						/>
					</TextField>
					<Button
						isDisabled={!(activeProjectId && activeConversationId)}
						onPress={onCreate}
					>
						<Button.Label>Create Checkpoint</Button.Label>
					</Button>
				</Surface>

				{checkpoints?.map((checkpoint) => (
					<Surface
						className="rounded-lg p-3"
						key={checkpoint._id}
						variant="secondary"
					>
						<Text className="font-medium text-foreground">
							{checkpoint.description ?? "Checkpoint"}
						</Text>
						<Text className="text-muted text-xs">
							Message #{checkpoint.messageIndex}
						</Text>
					</Surface>
				))}
			</ScrollView>
		</Container>
	);
}
