import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button, Surface, TextField } from "heroui-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

export default function MCPScreen() {
  const servers = useQuery(api.mcpServers.list, {});
  const createServer = useMutation(api.mcpServers.create);
  const removeServer = useMutation(api.mcpServers.remove);
  const updateStatus = useMutation(api.mcpServers.updateStatus);

  const [name, setName] = useState("");
  const [transport, setTransport] = useState("stdio");
  const [command, setCommand] = useState("");
  const [url, setUrl] = useState("");

  const onCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    await createServer({
      name: trimmedName,
      transport,
      command: command.trim() || undefined,
      url: url.trim() || undefined,
      scope: "user",
      importedFromClaudeDesktop: false,
    });
    setName("");
    setCommand("");
    setUrl("");
  };

  return (
    <Container>
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2">
        <Surface variant="secondary" className="p-3 rounded-lg gap-2">
          <Text className="text-lg font-semibold text-foreground">MCP Servers</Text>
          <TextField>
            <TextField.Input value={name} onChangeText={setName} placeholder="Name" />
          </TextField>
          <TextField>
            <TextField.Input value={transport} onChangeText={setTransport} placeholder="Transport" />
          </TextField>
          <TextField>
            <TextField.Input value={command} onChangeText={setCommand} placeholder="Command" />
          </TextField>
          <TextField>
            <TextField.Input value={url} onChangeText={setUrl} placeholder="URL" />
          </TextField>
          <Button onPress={onCreate} isDisabled={!name.trim()}>
            <Button.Label>Add</Button.Label>
          </Button>
        </Surface>

        {servers?.map((server) => (
          <Surface key={server._id} variant="secondary" className="p-3 rounded-lg">
            <View className="flex-row justify-between items-center gap-2">
              <View className="flex-1">
                <Text className="text-foreground font-medium">{server.name}</Text>
                <Text className="text-muted text-xs">{server.transport}</Text>
                <Text className="text-muted text-xs">{server.status ?? "unknown"}</Text>
              </View>
              <View className="gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() =>
                    updateStatus({
                      serverId: server._id,
                      status: server.isActive ? "disconnected" : "connected",
                      isActive: !server.isActive,
                    })
                  }
                >
                  <Button.Label>{server.isActive ? "Disable" : "Enable"}</Button.Label>
                </Button>
                <Button size="sm" variant="ghost" onPress={() => removeServer({ serverId: server._id })}>
                  <Button.Label>Delete</Button.Label>
                </Button>
              </View>
            </View>
          </Surface>
        ))}
      </ScrollView>
    </Container>
  );
}
