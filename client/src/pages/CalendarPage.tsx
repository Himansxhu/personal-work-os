import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useWorkspace } from "../lib/workspace-context";
import { listTasks } from "../lib/api";
import type { Task } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { TaskDialog } from "../features/tasks/TaskDialog";
import { PRIORITY_COLOR } from "../lib/utils";

type Granularity = "day" | "week" | "month";

export function CalendarPage() {
  const { workspaceId } = useWorkspace();
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [cursor, setCursor] = useState(new Date());
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [createDate, setCreateDate] = useState<string | null>(null);

  const { data: tasks } = useQuery({
    queryKey: ["tasks", workspaceId, "list"],
    queryFn: () => listTasks({ workspaceId }),
  });

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks ?? []) {
      if (!t.dueDate) continue;
      const key = t.dueDate.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  const goPrev = () =>
    setCursor((c) => (granularity === "month" ? subMonths(c, 1) : granularity === "week" ? subWeeks(c, 1) : addDays(c, -1)));
  const goNext = () =>
    setCursor((c) => (granularity === "month" ? addMonths(c, 1) : granularity === "week" ? addWeeks(c, 1) : addDays(c, 1)));

  const days = useMemo(() => {
    if (granularity === "day") return [cursor];
    if (granularity === "week") return eachDayOfInterval({ start: startOfWeek(cursor), end: endOfWeek(cursor) });
    return eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor)), end: endOfWeek(endOfMonth(cursor)) });
  }, [cursor, granularity]);

  const label =
    granularity === "day"
      ? format(cursor, "EEEE, MMM d yyyy")
      : granularity === "week"
      ? `${format(startOfWeek(cursor), "MMM d")} - ${format(endOfWeek(cursor), "MMM d, yyyy")}`
      : format(cursor, "MMMM yyyy");

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Calendar"
        subtitle={label}
        actions={
          <>
            <div className="flex items-center rounded-md border border-[var(--border)]">
              <button onClick={goPrev} className="p-1.5 hover:bg-[var(--bg-hover)]">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCursor(new Date())} className="px-2 text-xs hover:bg-[var(--bg-hover)]">
                Today
              </button>
              <button onClick={goNext} className="p-1.5 hover:bg-[var(--bg-hover)]">
                <ChevronRight size={16} />
              </button>
            </div>
            {(["day", "week", "month"] as Granularity[]).map((g) => (
              <Button key={g} variant={granularity === g ? "primary" : "secondary"} size="sm" onClick={() => setGranularity(g)}>
                {g[0].toUpperCase() + g.slice(1)}
              </Button>
            ))}
          </>
        }
      />

      <div className="flex-1 overflow-y-auto p-4">
        {granularity === "month" && (
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="bg-[var(--bg-subtle)] py-1.5 text-center text-xs font-medium text-[var(--text-muted)]">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDay.get(key) ?? [];
              return (
                <div
                  key={key}
                  className={`min-h-[100px] bg-[var(--bg)] p-1.5 ${!isSameMonth(day, cursor) ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${isSameDay(day, new Date()) ? "flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] font-medium text-[var(--accent-fg)]" : "text-[var(--text-faint)]"}`}
                    >
                      {format(day, "d")}
                    </span>
                    <button onClick={() => setCreateDate(key)} className="rounded p-0.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)]">
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayTasks.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setEditTask(t)}
                        className="block w-full truncate rounded px-1 py-0.5 text-left text-[11px] hover:bg-[var(--bg-hover)]"
                        style={{ backgroundColor: `${PRIORITY_COLOR[t.priority]}1a` }}
                      >
                        {t.title}
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-[var(--text-faint)]">+{dayTasks.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(granularity === "week" || granularity === "day") && (
          <div className={`grid gap-3 ${granularity === "week" ? "grid-cols-7" : "grid-cols-1"}`}>
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDay.get(key) ?? [];
              return (
                <div key={key} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text)]">{format(day, "EEE d")}</span>
                    <button onClick={() => setCreateDate(key)} className="rounded p-1 text-[var(--text-faint)] hover:bg-[var(--bg-hover)]">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {dayTasks.length === 0 && <p className="text-xs text-[var(--text-faint)]">No tasks</p>}
                    {dayTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setEditTask(t)}
                        className="flex w-full items-center gap-2 rounded border border-[var(--border)] px-2 py-1.5 text-left text-sm hover:bg-[var(--bg-subtle)]"
                      >
                        <span className="truncate">{t.title}</span>
                        <Badge color={PRIORITY_COLOR[t.priority]} className="ml-auto shrink-0 text-[10px]">
                          {t.priority}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TaskDialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)} workspaceId={workspaceId} task={editTask} />
      <TaskDialog
        open={!!createDate}
        onOpenChange={(o) => !o && setCreateDate(null)}
        workspaceId={workspaceId}
        defaultDueDate={createDate}
      />
    </div>
  );
}
