import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Archive, Trash2, CheckCircle2 } from "lucide-react";
import { Dialog } from "../../components/ui/Dialog";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import {
  archiveTask,
  completeTask,
  createTask,
  deleteTask,
  duplicateTask,
  listProjects,
  updateTask,
} from "../../lib/api";
import type { Priority, Task, TaskStatus } from "../../lib/types";
import { STATUS_LABEL } from "../../lib/utils";

const PRIORITY_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];
const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  task?: Task | null;
  defaultProjectId?: string | null;
  defaultStatus?: string;
  defaultDueDate?: string | null;
}

export function TaskDialog({
  open,
  onOpenChange,
  workspaceId,
  task,
  defaultProjectId,
  defaultStatus,
  defaultDueDate,
}: TaskDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!task;
  const effectiveWorkspaceId = task?.workspaceId ?? workspaceId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Todo");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const { data: projects } = useQuery({
    queryKey: ["projects", effectiveWorkspaceId],
    queryFn: () => listProjects({ workspaceId: effectiveWorkspaceId }),
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setNotes(task.notes);
      setProjectId(task.projectId ?? "none");
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
      setTagsInput(task.tags.map((t) => t.name).join(", "));
    } else {
      setTitle("");
      setDescription("");
      setNotes("");
      setProjectId(defaultProjectId ?? "none");
      setPriority("Medium");
      setStatus(defaultStatus ?? "Todo");
      setDueDate(defaultDueDate ?? "");
      setTagsInput("");
    }
  }, [open, task, defaultProjectId, defaultStatus, defaultDueDate]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const buildPayload = () => ({
    workspaceId: effectiveWorkspaceId,
    projectId: projectId === "none" ? null : projectId,
    title,
    description,
    notes,
    priority: priority as Priority,
    status: status as TaskStatus,
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    tags: tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  });

  const saveMutation = useMutation({
    mutationFn: () => (isEdit ? updateTask(task!.id, buildPayload()) : createTask(buildPayload())),
    onSuccess: () => {
      invalidate();
      onOpenChange(false);
    },
  });

  const actionMutation = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      invalidate();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={isEdit ? "Edit task" : "New task"} className="max-w-xl">
      <div className="space-y-3">
        <Input autoFocus placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Textarea placeholder="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Project</label>
            <Select
              value={projectId}
              onValueChange={setProjectId}
              options={[{ value: "none", label: "No project" }, ...(projects?.map((p) => ({ value: p.id, label: p.name })) ?? [])]}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Due date</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Priority</label>
            <Select value={priority} onValueChange={setPriority} options={PRIORITY_OPTIONS} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Status</label>
            <Select value={status} onValueChange={setStatus} options={STATUS_OPTIONS} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Tags (comma separated)</label>
          <Input placeholder="e.g. urgent, client-x" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            {isEdit && (
              <>
                {task!.status !== "Done" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Mark complete"
                    onClick={() => actionMutation.mutate(() => completeTask(task!.id))}
                  >
                    <CheckCircle2 size={16} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Duplicate"
                  onClick={() => actionMutation.mutate(() => duplicateTask(task!.id))}
                >
                  <Copy size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Archive"
                  onClick={() => actionMutation.mutate(() => archiveTask(task!.id))}
                >
                  <Archive size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete"
                  onClick={() => {
                    if (confirm("Delete this task permanently?")) {
                      actionMutation.mutate(() => deleteTask(task!.id));
                    }
                  }}
                >
                  <Trash2 size={16} className="text-[var(--danger)]" />
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!title.trim() || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {isEdit ? "Save" : "Create task"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
