import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button, Surface, TextField } from "heroui-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

export default function CheckpointsScreen() {
  const projects = useQuery(api.projects.list);
  const firstProjectId = useMemo(() => projects?.[0]?._id ?? null, [projects]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const activeProjectId = selectedProjectId ?? firstProjectId;
  const conversations = useQuery(
    api.conversations.listByProject,
    activeProjectId ? { projectId: activeProjectId } : "skip",
  );
  const firstConversationId = useMemo(() => conversations?.[0]?._id ?? null, [conversations]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const activeConversationId = selectedConversationId ?? firstConversationId;
  const checkpoints = useQuery(
    api.checkpoints.listByConversation,
    activeConversationId ? { conversationId: activeConversationId } : "skip",
  );

  const createCheckpoint = useMutation(api.checkpoints.create);
  const [messageIndex, setMessageIndex] = useState("0");

  const onCreate = async () => {
    if (!activeProjectId || !activeConversationId) {
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
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2">
        <Surface variant="secondary" className="p-3 rounded-lg gap-2">
          <Text className="text-lg font-semibold text-foreground">Checkpoints</Text>
          <View className="flex-row flex-wrap gap-2">
            {projects?.map((project) => (
              <Button
                key={project._id}
                variant={(selectedProjectId ?? firstProjectId) === project._id ? "primary" : "secondary"}
                size="sm"
                onPress={() => {
                  setSelectedProjectId(project._id);
                  setSelectedConversationId(null);
                }}
              >
                <Button.Label>{project.name}</Button.Label>
              </Button>
            ))}
          </View>
          <View className="flex-row flex-wrap gap-2">
            {conversations?.map((conversation) => (
              <Button
                key={conversation._id}
                variant={
                  (selectedConversationId ?? firstConversationId) === conversation._id
                    ? "primary"
                    : "secondary"
                }
                size="sm"
                onPress={() => setSelectedConversationId(conversation._id)}
              >
                <Button.Label>{conversation.name ?? "Untitled"}</Button.Label>
              </Button>
            ))}
          </View>
          <TextField>
            <TextField.Input value={messageIndex} onChangeText={setMessageIndex} placeholder="Message index" />
          </TextField>
          <Button onPress={onCreate} isDisabled={!activeProjectId || !activeConversationId}>
            <Button.Label>Create Checkpoint</Button.Label>
          </Button>
        </Surface>

        {checkpoints?.map((checkpoint) => (
          <Surface key={checkpoint._id} variant="secondary" className="p-3 rounded-lg">
            <Text className="text-foreground font-medium">{checkpoint.description ?? "Checkpoint"}</Text>
            <Text className="text-muted text-xs">Message #{checkpoint.messageIndex}</Text>
          </Surface>
        ))}
      </ScrollView>
    </Container>
  );
}
