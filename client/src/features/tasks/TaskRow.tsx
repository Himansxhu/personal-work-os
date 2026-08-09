import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Copy, Archive, Trash2, CheckCircle2, Circle } from "lucide-react";
import type { Task } from "../../lib/types";
import { Badge } from "../../components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu";
import { archiveTask, completeTask, deleteTask, duplicateTask, updateTask } from "../../lib/api";
import { formatDate, isOverdue, PRIORITY_COLOR, STATUS_COLOR, STATUS_LABEL } from "../../lib/utils";

export function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const mutate = (fn: () => Promise<unknown>) => fn().then(invalidate);

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      className="group flex cursor-pointer items-center gap-3 border-b border-[var(--border)] px-4 py-2.5 hover:bg-[var(--bg-subtle)]"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          mutate(() =>
            task.status === "Done" ? updateTask(task.id, { status: "Todo" }) : completeTask(task.id)
          );
        }}
        className="shrink-0"
      >
        {task.status === "Done" ? (
          <CheckCircle2 size={18} className="text-[var(--success)]" />
        ) : (
          <Circle size={18} className="text-[var(--text-faint)] hover:text-[var(--accent)]" />
        )}
      </button>

      <span
        className={`flex-1 truncate text-sm ${
          task.status === "Done" ? "text-[var(--text-faint)] line-through" : "text-[var(--text)]"
        }`}
      >
        {task.title}
      </span>

      {task.project && (
        <Badge color={task.project.color} className="hidden shrink-0 sm:inline-flex">
          {task.project.name}
        </Badge>
      )}

      {task.tags.slice(0, 2).map((tag) => (
        <Badge key={tag.id} className="hidden shrink-0 md:inline-flex">
          {tag.name}
        </Badge>
      ))}

      <Badge color={STATUS_COLOR[task.status]} className="shrink-0">
        {STATUS_LABEL[task.status]}
      </Badge>

      <Badge color={PRIORITY_COLOR[task.priority]} className="shrink-0">
        {task.priority}
      </Badge>

      {task.dueDate && (
        <span className={`w-16 shrink-0 text-right text-xs ${overdue ? "font-medium text-[var(--danger)]" : "text-[var(--text-faint)]"}`}>
          {formatDate(task.dueDate)}
        </span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <button className="shrink-0 rounded p-1 text-[var(--text-faint)] opacity-0 hover:bg-[var(--bg-hover)] group-hover:opacity-100">
            <MoreHorizontal size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => mutate(() => duplicateTask(task.id))}>
            <Copy size={14} /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => mutate(() => archiveTask(task.id))}>
            <Archive size={14} /> Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            danger
            onSelect={() => {
              if (confirm("Delete this task permanently?")) mutate(() => deleteTask(task.id));
            }}
          >
            <Trash2 size={14} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
