import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button, Surface, TextField } from "heroui-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

export default function ConversationsScreen() {
  const projects = useQuery(api.projects.list);
  const firstProjectId = useMemo(() => projects?.[0]?._id ?? null, [projects]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const activeProjectId = selectedProjectId ?? firstProjectId;

  const conversations = useQuery(
    api.conversations.listByProject,
    activeProjectId ? { projectId: activeProjectId } : "skip",
  );
  const createConversation = useMutation(api.conversations.create);
  const [name, setName] = useState("");

  const onCreate = async () => {
    if (!activeProjectId) {
      return;
    }
    await createConversation({ projectId: activeProjectId, name: name.trim() || undefined });
    setName("");
  };

  return (
    <Container>
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2">
        <Surface variant="secondary" className="p-3 rounded-lg gap-2">
          <Text className="text-lg font-semibold text-foreground">Conversations</Text>
          <View className="flex-row flex-wrap gap-2">
            {projects?.map((project) => {
              const isActive = (selectedProjectId ?? firstProjectId) === project._id;
              return (
                <Button
                  key={project._id}
                  variant={isActive ? "primary" : "secondary"}
                  onPress={() => setSelectedProjectId(project._id)}
                  size="sm"
                >
                  <Button.Label>{project.name}</Button.Label>
                </Button>
              );
            })}
          </View>
          <TextField>
            <TextField.Input
              value={name}
              onChangeText={setName}
              placeholder="Conversation name (optional)"
            />
          </TextField>
          <Button onPress={onCreate} isDisabled={!activeProjectId}>
            <Button.Label>Create</Button.Label>
          </Button>
        </Surface>

        {conversations?.map((conversation) => (
          <Surface key={conversation._id} variant="secondary" className="p-3 rounded-lg">
            <Text className="text-foreground font-medium">{conversation.name ?? "Untitled"}</Text>
            <Text className="text-muted text-xs">{conversation.projectPath}</Text>
          </Surface>
        ))}
      </ScrollView>
    </Container>
  );
}
