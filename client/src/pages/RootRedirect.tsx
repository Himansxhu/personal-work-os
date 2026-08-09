import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorkspace, listWorkspaces } from "../lib/api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function RootRedirect() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: workspaces, isLoading } = useQuery({ queryKey: ["workspaces"], queryFn: listWorkspaces });
  const [name, setName] = useState("");

  const createMutation = useMutation({
    mutationFn: () => createWorkspace({ name }),
    onSuccess: (ws) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      navigate(`/w/${ws.id}/dashboard`, { replace: true });
    },
  });

  useEffect(() => {
    if (isLoading) return;
    if (workspaces && workspaces.length > 0) {
      navigate(`/w/${workspaces[0].id}/dashboard`, { replace: true });
    }
  }, [workspaces, isLoading, navigate]);

  if (isLoading || (workspaces && workspaces.length > 0)) return null;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] text-center">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text)]">Welcome to your Work OS</h1>
        <p className="text-sm text-[var(--text-muted)]">Create your first workspace to get started</p>
      </div>
      <div className="flex w-72 gap-2">
        <Input
          autoFocus
          placeholder="e.g. Personal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && createMutation.mutate()}
        />
        <Button variant="primary" disabled={!name.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>
          Create
        </Button>
      </div>
    </div>
  );
}
