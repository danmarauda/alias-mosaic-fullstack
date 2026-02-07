"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ConversationsPage() {
  const projects = useQuery(api.projects.list);
  const createConversation = useMutation(api.conversations.create);

  const firstProjectId = useMemo(() => projects?.[0]?._id ?? null, [projects]);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
  const [name, setName] = useState("");
  const activeProjectId = selectedProjectId ?? firstProjectId;
  const conversations = useQuery(
    api.conversations.listByProject,
    activeProjectId ? { projectId: activeProjectId } : "skip",
  );

  const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeProjectId) {
      return;
    }
    await createConversation({ projectId: activeProjectId, name: name.trim() || undefined });
    setName("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {projects?.map((project) => {
              const isActive = (selectedProjectId ?? firstProjectId) === project._id;
              return (
                <Button
                  key={project._id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedProjectId(project._id)}
                >
                  {project.name}
                </Button>
              );
            })}
          </div>

          <form onSubmit={onCreate} className="grid gap-2 md:grid-cols-[1fr_auto]">
            <Input
              placeholder="Conversation name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" disabled={!activeProjectId}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!projects ? <p>Loading projects...</p> : null}
          {projects && projects.length === 0 ? <p>Create a project first.</p> : null}
          {activeProjectId && !conversations ? <p>Loading conversations...</p> : null}
          {conversations?.length === 0 ? <p>No conversations yet.</p> : null}
          {conversations?.map((conversation) => (
            <div key={conversation._id} className="rounded border p-2">
              <p className="font-medium">{conversation.name ?? "Untitled"}</p>
              <p className="text-sm text-muted-foreground">{conversation.projectPath}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
