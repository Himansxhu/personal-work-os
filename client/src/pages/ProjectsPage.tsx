import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Folder, MoreHorizontal, Archive, Trash2 } from "lucide-react";
import { useWorkspace } from "../lib/workspace-context";
import { createProject, deleteProject, listProjects, updateProject } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { Input, Textarea } from "../components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";

const PROJECT_COLORS = ["#6366f1", "#e5484d", "#f5a524", "#30a46c", "#0ea5e9", "#d946ef", "#f97316"];

export function ProjectsPage() {
  const { workspaceId } = useWorkspace();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", workspaceId, "active"],
    queryFn: () => listProjects({ workspaceId, status: "active" }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const createMutation = useMutation({
    mutationFn: () => createProject({ workspaceId, name, description, color }),
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      setName("");
      setDescription("");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => updateProject(id, { status: "archived" }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: invalidate,
  });

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Projects"
        subtitle={`${projects?.length ?? 0} project${projects?.length === 1 ? "" : "s"}`}
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> New project
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && <p className="text-sm text-[var(--text-faint)]">Loading...</p>}
        {!isLoading && (projects?.length ?? 0) === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-[var(--text-muted)]">No projects yet</p>
            <Button variant="secondary" onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> Create your first project
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/w/${workspaceId}/projects/${p.id}`)}
              className="group cursor-pointer rounded-lg border border-[var(--border)] p-4 hover:border-[var(--accent)]"
            >
              <div className="flex items-start justify-between">
                <Folder size={18} style={{ color: p.color }} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <button className="rounded p-1 text-[var(--text-faint)] opacity-0 hover:bg-[var(--bg-hover)] group-hover:opacity-100">
                      <MoreHorizontal size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => archiveMutation.mutate(p.id)}>
                      <Archive size={14} /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      danger
                      onSelect={() => {
                        if (confirm(`Delete "${p.name}" and all its tasks?`)) deleteMutation.mutate(p.id);
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mt-2 text-sm font-medium text-[var(--text)]">{p.name}</p>
              {p.description && <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">{p.description}</p>}
              <p className="mt-3 text-xs text-[var(--text-faint)]">{p._count?.tasks ?? 0} tasks</p>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen} title="New project">
        <div className="space-y-3">
          <Input autoFocus placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea placeholder="Description (optional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--bg)]" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!name.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>
              Create
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
