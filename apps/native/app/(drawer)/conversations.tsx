import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Button, Input, Surface, TextField } from "heroui-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

export default function ConversationsScreen() {
	const projects = useQuery(api.projects.list);
	const firstProjectId = useMemo(() => projects?.[0]?._id ?? null, [projects]);
	const [selectedProjectId, setSelectedProjectId] =
		useState<Id<"projects"> | null>(null);
	const activeProjectId = selectedProjectId ?? firstProjectId;

	const conversations = useQuery(
		api.conversations.listByProject,
		activeProjectId ? { projectId: activeProjectId } : "skip"
	);
	const createConversation = useMutation(api.conversations.create);
	const [name, setName] = useState("");

	const onCreate = async () => {
		if (!activeProjectId) {
			return;
		}
		await createConversation({
			projectId: activeProjectId,
			name: name.trim() || undefined,
		});
		setName("");
	};

	return (
		<Container>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 8 }}
			>
				<Surface className="gap-2 rounded-lg p-3" variant="secondary">
					<Text className="font-semibold text-foreground text-lg">
						Conversations
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{projects?.map((project) => {
							const isActive =
								(selectedProjectId ?? firstProjectId) === project._id;
							return (
								<Button
									key={project._id}
									onPress={() => setSelectedProjectId(project._id)}
									size="sm"
									variant={isActive ? "primary" : "secondary"}
								>
									<Button.Label>{project.name}</Button.Label>
								</Button>
							);
						})}
					</View>
					<TextField>
						<Input
							onChangeText={setName}
							placeholder="Conversation name (optional)"
							value={name}
						/>
					</TextField>
					<Button isDisabled={!activeProjectId} onPress={onCreate}>
						<Button.Label>Create</Button.Label>
					</Button>
				</Surface>

				{conversations?.map((conversation) => (
					<Surface
						className="rounded-lg p-3"
						key={conversation._id}
						variant="secondary"
					>
						<Text className="font-medium text-foreground">
							{conversation.name ?? "Untitled"}
						</Text>
						<Text className="text-muted text-xs">
							{conversation.projectPath}
						</Text>
					</Surface>
				))}
			</ScrollView>
		</Container>
	);
}
