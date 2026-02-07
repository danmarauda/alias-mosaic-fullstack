"use client";

import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
  const projects = useQuery(api.projects.list);
  const createProject = useMutation(api.projects.create);
  const removeProject = useMutation(api.projects.remove);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedPath = path.trim();
    if (!trimmedName || !trimmedPath) {
      return;
    }
    await createProject({ name: trimmedName, path: trimmedPath });
    setName("");
    setPath("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" onSubmit={onCreate}>
            <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="/absolute/path" value={path} onChange={(e) => setPath(e.target.value)} />
            <Button type="submit" disabled={!name.trim() || !path.trim()}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!projects ? <p>Loading...</p> : null}
          {projects?.length === 0 ? <p>No projects yet.</p> : null}
          {projects?.map((project) => (
            <div key={project._id} className="flex items-center justify-between rounded border p-2 gap-2">
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-muted-foreground">{project.path}</p>
              </div>
              <Button variant="outline" onClick={() => removeProject({ projectId: project._id })}>
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
