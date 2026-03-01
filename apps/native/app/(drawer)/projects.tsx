import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button, Input, Surface, TextField } from "heroui-native";
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
		if (!(trimmedName && trimmedPath)) {
			return;
		}
		await createProject({ name: trimmedName, path: trimmedPath });
		setName("");
		setPath("");
	};

	return (
		<Container>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 8 }}
			>
				<Surface className="gap-2 rounded-lg p-3" variant="secondary">
					<Text className="font-semibold text-foreground text-lg">
						Projects
					</Text>
					<TextField>
						<Input
							onChangeText={setName}
							placeholder="Project name"
							value={name}
						/>
					</TextField>
					<TextField>
						<Input
							onChangeText={setPath}
							placeholder="/absolute/path"
							value={path}
						/>
					</TextField>
					<Button isDisabled={!(name.trim() && path.trim())} onPress={onCreate}>
						<Button.Label>Add</Button.Label>
					</Button>
				</Surface>

				{projects?.map((project) => (
					<Surface
						className="rounded-lg p-3"
						key={project._id}
						variant="secondary"
					>
						<View className="flex-row items-center justify-between gap-2">
							<View className="flex-1">
								<Text className="font-medium text-foreground">
									{project.name}
								</Text>
								<Text className="text-muted text-xs">{project.path}</Text>
							</View>
							<Button
								onPress={() => removeProject({ projectId: project._id })}
								variant="ghost"
							>
								<Button.Label>Delete</Button.Label>
							</Button>
						</View>
					</Surface>
				))}
			</ScrollView>
		</Container>
	);
}
