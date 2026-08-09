import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { useWorkspace } from "../lib/workspace-context";
import { listTasks } from "../lib/api";
import type { Task } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { TaskRow } from "../features/tasks/TaskRow";
import { TaskDialog } from "../features/tasks/TaskDialog";
import { STATUS_LABEL } from "../lib/utils";

export function TasksListPage() {
  const { workspaceId } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", workspaceId, "list"],
    queryFn: () => listTasks({ workspaceId }),
  });

  const openTaskId = searchParams.get("task");
  const openTask = tasks?.find((t) => t.id === openTaskId) ?? null;

  const filtered = useMemo(() => {
    return (tasks ?? []).filter(
      (t) =>
        (statusFilter === "all" || t.status === statusFilter) &&
        (priorityFilter === "all" || t.priority === priorityFilter)
    );
  }, [tasks, statusFilter, priorityFilter]);

  const closeTask = () => {
    searchParams.delete("task");
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Tasks"
        subtitle={`${filtered.length} task${filtered.length === 1 ? "" : "s"}`}
        actions={
          <>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-36"
              options={[{ value: "all", label: "All statuses" }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]}
            />
            <Select
              value={priorityFilter}
              onValueChange={setPriorityFilter}
              className="w-32"
              options={[
                { value: "all", label: "All priorities" },
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
            />
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> New task
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading && <p className="p-6 text-sm text-[var(--text-faint)]">Loading...</p>}
        {!isLoading && filtered.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-[var(--text-muted)]">No tasks yet</p>
            <Button variant="secondary" onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> Create your first task
            </Button>
          </div>
        )}
        {filtered.map((task: Task) => (
          <TaskRow
            key={task.id}
            task={task}
            onClick={() => setSearchParams({ task: task.id }, { replace: true })}
          />
        ))}
      </div>

      <TaskDialog open={createOpen} onOpenChange={setCreateOpen} workspaceId={workspaceId} />
      <TaskDialog open={!!openTask} onOpenChange={(o) => !o && closeTask()} workspaceId={workspaceId} task={openTask} />
    </div>
  );
}
