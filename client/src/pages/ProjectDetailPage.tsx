import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { getProject, listTasks, updateProject } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import { TaskRow } from "../features/tasks/TaskRow";
import { TaskDialog } from "../features/tasks/TaskDialog";
import type { Task } from "../lib/types";

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId!),
  });
  const { data: tasks } = useQuery({
    queryKey: ["tasks", "project", projectId],
    queryFn: () => listTasks({ projectId }),
    enabled: !!projectId,
  });

  const saveDescription = useMutation({
    mutationFn: (desc: string) => updateProject(projectId!, { description: desc }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
  });

  if (!project) return null;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={project.name}
        subtitle={`${tasks?.length ?? 0} tasks`}
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> New task
          </Button>
        }
      />
      <div className="border-b border-[var(--border)] px-6 py-3">
        <Textarea
          placeholder="Add a project description..."
          rows={2}
          value={description ?? project.description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => description !== null && description !== project.description && saveDescription.mutate(description)}
          className="border-none bg-transparent px-0 focus:ring-0"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {(tasks ?? []).length === 0 && (
          <p className="p-6 text-sm text-[var(--text-faint)]">No tasks in this project yet</p>
        )}
        {tasks?.map((t) => (
          <TaskRow key={t.id} task={t} onClick={() => setEditTask(t)} />
        ))}
      </div>

      <TaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={project.workspaceId}
        defaultProjectId={project.id}
      />
      <TaskDialog
        open={!!editTask}
        onOpenChange={(o) => !o && setEditTask(null)}
        workspaceId={project.workspaceId}
        task={editTask}
      />
    </div>
  );
}
