import { Button, Input, Spinner, Surface, TextField } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { authClient } from "@/lib/auth-client";

export function SignUp() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSignUp = async () => {
		setIsLoading(true);
		setError(null);

		await authClient.signUp.email(
			{
				name,
				email,
				password,
			},
			{
				onError: (error) => {
					setError(error.error?.message || "Failed to sign up");
					setIsLoading(false);
				},
				onSuccess: () => {
					setName("");
					setEmail("");
					setPassword("");
				},
				onFinished: () => {
					setIsLoading(false);
				},
			}
		);
	};

	return (
		<Surface className="rounded-lg p-4" variant="secondary">
			<Text className="mb-4 font-medium text-foreground">Create Account</Text>

			{error && (
				<View className="mb-3 rounded bg-danger/10 p-2">
					<Text className="text-danger text-sm">{error}</Text>
				</View>
			)}

			<View className="gap-3">
				<TextField>
					<Input onChangeText={setName} placeholder="Name" value={name} />
				</TextField>

				<TextField>
					<Input
						autoCapitalize="none"
						keyboardType="email-address"
						onChangeText={setEmail}
						placeholder="email@example.com"
						value={email}
					/>
				</TextField>

				<TextField>
					<Input
						onChangeText={setPassword}
						placeholder="Password"
						secureTextEntry
						value={password}
					/>
				</TextField>

				<Button className="mt-1" isDisabled={isLoading} onPress={handleSignUp}>
					{isLoading ? (
						<Spinner color="default" size="sm" />
					) : (
						<Button.Label>Create Account</Button.Label>
					)}
				</Button>
			</View>
		</Surface>
	);
}
