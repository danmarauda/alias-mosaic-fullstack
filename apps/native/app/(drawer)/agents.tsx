import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button, Input, Surface, TextField } from "heroui-native";
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
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 8 }}
			>
				<Surface className="gap-2 rounded-lg p-3" variant="secondary">
					<Text className="font-semibold text-foreground text-lg">Agents</Text>
					<TextField>
						<Input
							onChangeText={setName}
							placeholder="Agent name"
							value={name}
						/>
					</TextField>
					<Button isDisabled={!name.trim()} onPress={onCreate}>
						<Button.Label>Add</Button.Label>
					</Button>
				</Surface>

				{agents?.map((agent) => (
					<Surface
						className="rounded-lg p-3"
						key={agent._id}
						variant="secondary"
					>
						<View className="flex-row items-center justify-between gap-2">
							<View className="flex-1">
								<Text className="font-medium text-foreground">
									{agent.name}
								</Text>
								<Text className="text-muted text-xs">{agent.model}</Text>
							</View>
							<Button
								onPress={() => removeAgent({ agentId: agent._id })}
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
