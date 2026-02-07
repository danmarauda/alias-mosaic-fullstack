import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button, Surface, TextField } from "heroui-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

export default function AgentsScreen() {
  const agents = useQuery(api.agents.list);
  const createAgent = useMutation(api.agents.create);
  const removeAgent = useMutation(api.agents.remove);

  const [name, setName] = useState("");

  const onCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    await createAgent({
      name: trimmedName,
      icon: "bot",
      systemPrompt: "You are a helpful assistant.",
      model: "gemini-2.5-flash",
      enableFileRead: true,
      enableFileWrite: false,
      enableNetwork: false,
    });
    setName("");
  };

  return (
    <Container>
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2">
        <Surface variant="secondary" className="p-3 rounded-lg gap-2">
          <Text className="text-lg font-semibold text-foreground">Agents</Text>
          <TextField>
            <TextField.Input value={name} onChangeText={setName} placeholder="Agent name" />
          </TextField>
          <Button onPress={onCreate} isDisabled={!name.trim()}>
            <Button.Label>Add</Button.Label>
          </Button>
        </Surface>

        {agents?.map((agent) => (
          <Surface key={agent._id} variant="secondary" className="p-3 rounded-lg">
            <View className="flex-row justify-between items-center gap-2">
              <View className="flex-1">
                <Text className="text-foreground font-medium">{agent.name}</Text>
                <Text className="text-muted text-xs">{agent.model}</Text>
              </View>
              <Button variant="ghost" onPress={() => removeAgent({ agentId: agent._id })}>
                <Button.Label>Delete</Button.Label>
              </Button>
            </View>
          </Surface>
        ))}
      </ScrollView>
    </Container>
  );
}
