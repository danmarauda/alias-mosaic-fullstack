"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
	const profiles = useQuery(api.conductorProfiles.list);
	const createProfile = useMutation(api.conductorProfiles.create);
	const removeProfile = useMutation(api.conductorProfiles.remove);
	const setDefault = useMutation(api.conductorProfiles.setDefault);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		name: "",
		systemPrompt: "",
		model: "gemini-2.5-flash",
		isDefault: false,
	});

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!(form.name.trim() && form.systemPrompt.trim())) {
			return;
		}
		await createProfile({
			name: form.name.trim(),
			systemPrompt: form.systemPrompt.trim(),
			model: form.model,
			isDefault: form.isDefault,
		});
		setForm({
			name: "",
			systemPrompt: "",
			model: "gemini-2.5-flash",
			isDefault: false,
		});
		setOpen(false);
	};

	return (
		<div className="flex flex-col">
			<header className="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
				<h1 className="font-semibold text-lg">Settings</h1>
			</header>
			<div className="flex-1 space-y-6 p-6">
				<div>
					<div className="mb-4 flex items-center justify-between">
						<div>
							<h2 className="font-semibold text-lg">Conductor Profiles</h2>
							<p className="text-muted-foreground text-sm">
								AI persona configurations for conversations
							</p>
						</div>
						<Dialog onOpenChange={setOpen} open={open}>
							<DialogTrigger render={<Button size="sm" />}>
								<Plus className="mr-2 h-4 w-4" />
								New Profile
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Create Conductor Profile</DialogTitle>
								</DialogHeader>
								<form className="space-y-4" onSubmit={handleCreate}>
									<div className="space-y-2">
										<Label htmlFor="profile-name">Name</Label>
										<Input
											id="profile-name"
											onChange={(e) =>
												setForm((f) => ({
													...f,
													name: e.target.value,
												}))
											}
											value={form.name}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="profile-prompt">System Prompt</Label>
										<Textarea
											id="profile-prompt"
											onChange={(e) =>
												setForm((f) => ({
													...f,
													systemPrompt: e.target.value,
												}))
											}
											rows={4}
											value={form.systemPrompt}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="profile-model">Model</Label>
										<Input
											id="profile-model"
											onChange={(e) =>
												setForm((f) => ({
													...f,
													model: e.target.value,
												}))
											}
											value={form.model}
										/>
									</div>
									<div className="flex items-center justify-between">
										<Label htmlFor="profile-default">Set as default</Label>
										<Switch
											checked={form.isDefault}
											id="profile-default"
											onCheckedChange={(c) =>
												setForm((f) => ({ ...f, isDefault: c }))
											}
										/>
									</div>
									<Button className="w-full" type="submit">
										Create
									</Button>
								</form>
							</DialogContent>
						</Dialog>
					</div>

					{!profiles || profiles.length === 0 ? (
						<Card>
							<CardContent className="flex items-center justify-center py-8">
								<p className="text-muted-foreground">
									No conductor profiles yet.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							{profiles.map((profile) => (
								<Card key={profile._id}>
									<CardHeader className="flex flex-row items-start justify-between">
										<div>
											<CardTitle className="flex items-center gap-2 text-base">
												<Settings className="h-4 w-4" />
												{profile.name}
												{profile.isDefault && <Badge>Default</Badge>}
											</CardTitle>
										</div>
										<div className="flex gap-1">
											{!profile.isDefault && (
												<Button
													onClick={() =>
														setDefault({
															profileId: profile._id,
														})
													}
													size="sm"
													variant="outline"
												>
													Set Default
												</Button>
											)}
											<Button
												onClick={() =>
													removeProfile({
														profileId: profile._id,
													})
												}
												size="icon"
												variant="ghost"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</CardHeader>
									<CardContent>
										<p className="mb-2 line-clamp-2 text-muted-foreground text-sm">
											{profile.systemPrompt}
										</p>
										<Badge variant="outline">{profile.model}</Badge>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
