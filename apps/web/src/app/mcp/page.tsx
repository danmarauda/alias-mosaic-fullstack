"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function MCPPage() {
  const servers = useQuery(api.mcpServers.list, {});
  const createServer = useMutation(api.mcpServers.create);
  const removeServer = useMutation(api.mcpServers.remove);
  const updateStatus = useMutation(api.mcpServers.updateStatus);

  const [name, setName] = useState("");
  const [transport, setTransport] = useState("stdio");
  const [command, setCommand] = useState("");
  const [url, setUrl] = useState("");

  const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    <div className="mx-auto w-full max-w-3xl py-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>MCP Servers</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-2 md:grid-cols-2">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="Transport: stdio | sse | http"
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
            />
            <Input
              placeholder="Command (stdio)"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
            <Input placeholder="URL (http/sse)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <div className="md:col-span-2">
              <Button type="submit" disabled={!name.trim()}>
                Add Server
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {servers?.length === 0 ? <p>No MCP servers yet.</p> : null}
          {servers?.map((server) => (
            <div key={server._id} className="rounded border p-2 flex justify-between items-center gap-2">
              <div>
                <p className="font-medium">{server.name}</p>
                <p className="text-sm text-muted-foreground">
                  {server.transport} {server.command ?? server.url ?? ""}
                </p>
                <p className="text-xs text-muted-foreground">status: {server.status ?? "unknown"}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatus({
                      serverId: server._id,
                      status: server.isActive ? "disconnected" : "connected",
                      isActive: !server.isActive,
                    })
                  }
                >
                  {server.isActive ? "Disable" : "Enable"}
                </Button>
                <Button variant="outline" onClick={() => removeServer({ serverId: server._id })}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
