import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useWorkspace } from "../lib/workspace-context";
import { getDashboard } from "../lib/api";
import type { Task } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { TaskDialog } from "../features/tasks/TaskDialog";
import { formatDate, PRIORITY_COLOR } from "../lib/utils";

function MiniTaskList({ tasks, onClick, empty }: { tasks: Task[]; onClick: (t: Task) => void; empty: string }) {
  if (tasks.length === 0) return <p className="text-sm text-[var(--text-faint)]">{empty}</p>;
  return (
    <div className="space-y-1">
      {tasks.map((t) => (
        <button
          key={t.id}
          onClick={() => onClick(t)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--bg-hover)]"
        >
          <span className="truncate">{t.title}</span>
          {t.workspace && (
            <Badge color={t.workspace.color} className="ml-auto shrink-0 text-[10px]">
              {t.workspace.name}
            </Badge>
          )}
          {t.dueDate && <span className="shrink-0 text-xs text-[var(--text-faint)]">{formatDate(t.dueDate)}</span>}
        </button>
      ))}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <h3 className="mb-2 text-sm font-semibold text-[var(--text)]">{title}</h3>
      {children}
    </div>
  );
}

export function DashboardPage() {
  const { workspaceId, workspace } = useWorkspace();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={`Welcome back${workspace ? ` — ${workspace.name}` : ""}`}
        subtitle="Here's what's happening across your work"
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Quick add task
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title={`Today (${data?.today.length ?? 0})`}>
            <MiniTaskList tasks={data?.today ?? []} onClick={setEditTask} empty="Nothing due today" />
          </Card>
          <Card title={`Overdue (${data?.overdue.length ?? 0})`}>
            <MiniTaskList tasks={data?.overdue ?? []} onClick={setEditTask} empty="Nothing overdue" />
          </Card>
          <Card title={`Upcoming (${data?.upcoming.length ?? 0})`}>
            <MiniTaskList tasks={data?.upcoming ?? []} onClick={setEditTask} empty="Nothing upcoming" />
          </Card>
          <Card title={`Recently completed (${data?.recentlyCompleted.length ?? 0})`}>
            <MiniTaskList tasks={data?.recentlyCompleted ?? []} onClick={setEditTask} empty="No completed tasks yet" />
          </Card>

          <Card title="Tasks by workspace">
            <div className="space-y-1.5">
              {(data?.byWorkspace ?? []).length === 0 && <p className="text-sm text-[var(--text-faint)]">No active tasks</p>}
              {data?.byWorkspace.map(({ workspace: w, count }) => (
                <div key={w.id} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: w.color }} />
                  <span className="flex-1 truncate">{w.name}</span>
                  <span className="text-[var(--text-faint)]">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Tasks by priority">
            <div className="space-y-1.5">
              {Object.entries(data?.byPriority ?? {}).map(([priority, count]) => (
                <div key={priority} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[priority] }} />
                  <span className="flex-1">{priority}</span>
                  <span className="text-[var(--text-faint)]">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <TaskDialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)} workspaceId={workspaceId} task={editTask} />
      <TaskDialog open={createOpen} onOpenChange={setCreateOpen} workspaceId={workspaceId} />
    </div>
  );
}
