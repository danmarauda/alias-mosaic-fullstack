"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import type { Id } from "@alias-mosaic-fullstack/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CheckpointsPage() {
  const projects = useQuery(api.projects.list);
  const firstProjectId = useMemo(() => projects?.[0]?._id ?? null, [projects]);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
  const activeProjectId = selectedProjectId ?? firstProjectId;

  const conversations = useQuery(
    api.conversations.listByProject,
    activeProjectId ? { projectId: activeProjectId } : "skip",
  );
  const firstConversationId = useMemo(() => conversations?.[0]?._id ?? null, [conversations]);
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const activeConversationId = selectedConversationId ?? firstConversationId;

  const checkpoints = useQuery(
    api.checkpoints.listByConversation,
    activeConversationId ? { conversationId: activeConversationId } : "skip",
  );
  const createCheckpoint = useMutation(api.checkpoints.create);

  const [description, setDescription] = useState("");
  const [messageIndex, setMessageIndex] = useState("0");

  const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeProjectId || !activeConversationId) {
      return;
    }
    await createCheckpoint({
      projectId: activeProjectId,
      conversationId: activeConversationId,
      messageIndex: Number.parseInt(messageIndex, 10) || 0,
      description: description.trim() || undefined,
      trigger: "manual",
      toolsUsed: [],
      filesModified: [],
    });
    setDescription("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Checkpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {projects?.map((project) => {
              const isActive = (selectedProjectId ?? firstProjectId) === project._id;
              return (
                <Button
                  key={project._id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => {
                    setSelectedProjectId(project._id);
                    setSelectedConversationId(null);
                  }}
                >
                  {project.name}
                </Button>
              );
            })}
          </div>

          <div className="flex gap-2 flex-wrap">
            {conversations?.map((conversation) => {
              const isActive = (selectedConversationId ?? firstConversationId) === conversation._id;
              return (
                <Button
                  key={conversation._id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedConversationId(conversation._id)}
                >
                  {conversation.name ?? "Untitled"}
                </Button>
              );
            })}
          </div>

          <form onSubmit={onCreate} className="grid gap-2 md:grid-cols-[120px_1fr_auto]">
            <Input value={messageIndex} onChange={(e) => setMessageIndex(e.target.value)} placeholder="Index" />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
            <Button type="submit" disabled={!activeProjectId || !activeConversationId}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checkpoints?.length === 0 ? <p>No checkpoints yet.</p> : null}
          {checkpoints?.map((checkpoint) => (
            <div key={checkpoint._id} className="rounded border p-2">
              <p className="font-medium">{checkpoint.description ?? "Manual checkpoint"}</p>
              <p className="text-sm text-muted-foreground">
                Message #{checkpoint.messageIndex} - {new Date(checkpoint.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
