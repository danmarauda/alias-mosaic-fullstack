import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button, Surface, TextField } from "heroui-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

export default function ProjectsScreen() {
  const projects = useQuery(api.projects.list);
  const createProject = useMutation(api.projects.create);
  const removeProject = useMutation(api.projects.remove);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  const onCreate = async () => {
    const trimmedName = name.trim();
    const trimmedPath = path.trim();
    if (!trimmedName || !trimmedPath) {
      return;
    }
    await createProject({ name: trimmedName, path: trimmedPath });
    setName("");
    setPath("");
  };

  return (
    <Container>
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2">
        <Surface variant="secondary" className="p-3 rounded-lg gap-2">
          <Text className="text-lg font-semibold text-foreground">Projects</Text>
          <TextField>
            <TextField.Input value={name} onChangeText={setName} placeholder="Project name" />
          </TextField>
          <TextField>
            <TextField.Input value={path} onChangeText={setPath} placeholder="/absolute/path" />
          </TextField>
          <Button onPress={onCreate} isDisabled={!name.trim() || !path.trim()}>
            <Button.Label>Add</Button.Label>
          </Button>
        </Surface>

        {projects?.map((project) => (
          <Surface key={project._id} variant="secondary" className="p-3 rounded-lg">
            <View className="flex-row justify-between items-center gap-2">
              <View className="flex-1">
                <Text className="text-foreground font-medium">{project.name}</Text>
                <Text className="text-muted text-xs">{project.path}</Text>
              </View>
              <Button variant="ghost" onPress={() => removeProject({ projectId: project._id })}>
                <Button.Label>Delete</Button.Label>
              </Button>
            </View>
          </Surface>
        ))}
      </ScrollView>
    </Container>
  );
}
