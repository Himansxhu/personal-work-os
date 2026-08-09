import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Trash2, FileText } from "lucide-react";
import { useWorkspace } from "../lib/workspace-context";
import { deleteNote, deleteTask, listNotes, listTasks, restoreNote, restoreTask } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import * as RadixTabs from "@radix-ui/react-tabs";
import { PRIORITY_COLOR, formatDate } from "../lib/utils";

export function ArchivePage() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"tasks" | "notes">("tasks");

  const { data: tasks } = useQuery({
    queryKey: ["tasks", workspaceId, "archived"],
    queryFn: () => listTasks({ workspaceId, archived: true }),
  });
  const { data: notes } = useQuery({
    queryKey: ["notes", workspaceId, "archived"],
    queryFn: () => listNotes({ workspaceId, archived: true }),
  });

  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const invalidateNotes = () => queryClient.invalidateQueries({ queryKey: ["notes"] });

  const restoreTaskMutation = useMutation({ mutationFn: restoreTask, onSuccess: invalidateTasks });
  const deleteTaskMutation = useMutation({ mutationFn: deleteTask, onSuccess: invalidateTasks });
  const restoreNoteMutation = useMutation({ mutationFn: restoreNote, onSuccess: invalidateNotes });
  const deleteNoteMutation = useMutation({ mutationFn: deleteNote, onSuccess: invalidateNotes });

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Archive" subtitle="Completed and archived tasks & notes" />

      <RadixTabs.Root value={tab} onValueChange={(v) => setTab(v as "tasks" | "notes")} className="flex flex-1 flex-col overflow-hidden">
        <RadixTabs.List className="flex gap-1 border-b border-[var(--border)] px-6">
          <RadixTabs.Trigger
            value="tasks"
            className="border-b-2 border-transparent px-2 py-2.5 text-sm font-medium text-[var(--text-muted)] data-[state=active]:border-[var(--accent)] data-[state=active]:text-[var(--text)]"
          >
            Tasks ({tasks?.length ?? 0})
          </RadixTabs.Trigger>
          <RadixTabs.Trigger
            value="notes"
            className="border-b-2 border-transparent px-2 py-2.5 text-sm font-medium text-[var(--text-muted)] data-[state=active]:border-[var(--accent)] data-[state=active]:text-[var(--text)]"
          >
            Notes ({notes?.length ?? 0})
          </RadixTabs.Trigger>
        </RadixTabs.List>

        <RadixTabs.Content value="tasks" className="flex-1 overflow-y-auto">
          {(tasks ?? []).length === 0 && <p className="p-6 text-sm text-[var(--text-faint)]">No archived tasks</p>}
          {tasks?.map((t) => (
            <div key={t.id} className="flex items-center gap-3 border-b border-[var(--border)] px-6 py-2.5">
              <span className="flex-1 truncate text-sm text-[var(--text-muted)]">{t.title}</span>
              <Badge color={PRIORITY_COLOR[t.priority]}>{t.priority}</Badge>
              {t.dueDate && <span className="text-xs text-[var(--text-faint)]">{formatDate(t.dueDate)}</span>}
              <Button variant="ghost" size="icon" title="Restore" onClick={() => restoreTaskMutation.mutate(t.id)}>
                <RotateCcw size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Delete permanently"
                onClick={() => {
                  if (confirm("Permanently delete this task?")) deleteTaskMutation.mutate(t.id);
                }}
              >
                <Trash2 size={14} className="text-[var(--danger)]" />
              </Button>
            </div>
          ))}
        </RadixTabs.Content>

        <RadixTabs.Content value="notes" className="flex-1 overflow-y-auto">
          {(notes ?? []).length === 0 && <p className="p-6 text-sm text-[var(--text-faint)]">No archived notes</p>}
          {notes?.map((n) => (
            <div key={n.id} className="flex items-center gap-3 border-b border-[var(--border)] px-6 py-2.5">
              <FileText size={14} className="shrink-0 text-[var(--text-faint)]" />
              <span className="flex-1 truncate text-sm text-[var(--text-muted)]">{n.title || "Untitled"}</span>
              <Button variant="ghost" size="icon" title="Restore" onClick={() => restoreNoteMutation.mutate(n.id)}>
                <RotateCcw size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Delete permanently"
                onClick={() => {
                  if (confirm("Permanently delete this note?")) deleteNoteMutation.mutate(n.id);
                }}
              >
                <Trash2 size={14} className="text-[var(--danger)]" />
              </Button>
            </div>
          ))}
        </RadixTabs.Content>
      </RadixTabs.Root>
    </div>
  );
}
