import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button, Input, Surface, TextField } from "heroui-native";
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
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 8 }}
			>
				<Surface className="gap-2 rounded-lg p-3" variant="secondary">
					<Text className="font-semibold text-foreground text-lg">
						MCP Servers
					</Text>
					<TextField>
						<Input onChangeText={setName} placeholder="Name" value={name} />
					</TextField>
					<TextField>
						<Input
							onChangeText={setTransport}
							placeholder="Transport"
							value={transport}
						/>
					</TextField>
					<TextField>
						<Input
							onChangeText={setCommand}
							placeholder="Command"
							value={command}
						/>
					</TextField>
					<TextField>
						<Input onChangeText={setUrl} placeholder="URL" value={url} />
					</TextField>
					<Button isDisabled={!name.trim()} onPress={onCreate}>
						<Button.Label>Add</Button.Label>
					</Button>
				</Surface>

				{servers?.map((server) => (
					<Surface
						className="rounded-lg p-3"
						key={server._id}
						variant="secondary"
					>
						<View className="flex-row items-center justify-between gap-2">
							<View className="flex-1">
								<Text className="font-medium text-foreground">
									{server.name}
								</Text>
								<Text className="text-muted text-xs">{server.transport}</Text>
								<Text className="text-muted text-xs">
									{server.status ?? "unknown"}
								</Text>
							</View>
							<View className="gap-1">
								<Button
									onPress={() =>
										updateStatus({
											serverId: server._id,
											status: server.isActive ? "disconnected" : "connected",
											isActive: !server.isActive,
										})
									}
									size="sm"
									variant="secondary"
								>
									<Button.Label>
										{server.isActive ? "Disable" : "Enable"}
									</Button.Label>
								</Button>
								<Button
									onPress={() => removeServer({ serverId: server._id })}
									size="sm"
									variant="ghost"
								>
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
