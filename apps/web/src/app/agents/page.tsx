"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AgentsPage() {
  const agents = useQuery(api.agents.list);
  const createAgent = useMutation(api.agents.create);
  const removeAgent = useMutation(api.agents.remove);

  const [name, setName] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");

  const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    await createAgent({
      name: trimmedName,
      icon: "bot",
      systemPrompt: "You are a helpful assistant.",
      model,
      enableFileRead: true,
      enableFileWrite: false,
      enableNetwork: false,
    });
    setName("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" onSubmit={onCreate}>
            <Input placeholder="Agent name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
            <Button type="submit" disabled={!name.trim()}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configured</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!agents ? <p>Loading...</p> : null}
          {agents?.length === 0 ? <p>No agents yet.</p> : null}
          {agents?.map((agent) => (
            <div key={agent._id} className="flex items-center justify-between rounded border p-2 gap-2">
              <div>
                <p className="font-medium">{agent.name}</p>
                <p className="text-sm text-muted-foreground">{agent.model}</p>
              </div>
              <Button variant="outline" onClick={() => removeAgent({ agentId: agent._id })}>
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
