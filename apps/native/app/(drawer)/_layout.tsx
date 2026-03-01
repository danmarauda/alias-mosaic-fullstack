import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import { useCallback } from "react";
import { Pressable, Text } from "react-native";

import { ThemeToggle } from "@/components/theme-toggle";

function DrawerLayout() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");

	const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

	return (
		<Drawer
			screenOptions={{
				headerTintColor: themeColorForeground,
				headerStyle: { backgroundColor: themeColorBackground },
				headerTitleStyle: {
					fontWeight: "600",
					color: themeColorForeground,
				},
				headerRight: renderThemeToggle,
				drawerStyle: { backgroundColor: themeColorBackground },
			}}
		>
			<Drawer.Screen
				name="index"
				options={{
					headerTitle: "Home",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							Home
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							color={focused ? color : themeColorForeground}
							name="home-outline"
							size={size}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="(tabs)"
				options={{
					headerTitle: "Tabs",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							Tabs
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<MaterialIcons
							color={focused ? color : themeColorForeground}
							name="border-bottom"
							size={size}
						/>
					),
					headerRight: () => (
						<Link asChild href="/modal">
							<Pressable className="mr-4">
								<Ionicons
									color={themeColorForeground}
									name="add-outline"
									size={24}
								/>
							</Pressable>
						</Link>
					),
				}}
			/>
			<Drawer.Screen
				name="projects"
				options={{
					headerTitle: "Projects",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							Projects
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							color={focused ? color : themeColorForeground}
							name="folder-open-outline"
							size={size}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="agents"
				options={{
					headerTitle: "Agents",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							Agents
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							color={focused ? color : themeColorForeground}
							name="hardware-chip-outline"
							size={size}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="conversations"
				options={{
					headerTitle: "Conversations",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							Conversations
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							color={focused ? color : themeColorForeground}
							name="chatbubbles-outline"
							size={size}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="checkpoints"
				options={{
					headerTitle: "Checkpoints",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							Checkpoints
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							color={focused ? color : themeColorForeground}
							name="git-branch-outline"
							size={size}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="mcp"
				options={{
					headerTitle: "MCP",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							MCP
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							color={focused ? color : themeColorForeground}
							name="server-outline"
							size={size}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="todos"
				options={{
					headerTitle: "Todos",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							Todos
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							color={focused ? color : themeColorForeground}
							name="checkbox-outline"
							size={size}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="ai"
				options={{
					headerTitle: "AI",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							AI
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							color={focused ? color : themeColorForeground}
							name="chatbubble-ellipses-outline"
							size={size}
						/>
					),
				}}
			/>
		</Drawer>
	);
}

export default DrawerLayout;
