import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useWorkspace } from "../lib/workspace-context";
import { listTasks, updateTask } from "../lib/api";
import type { Task, TaskStatus } from "../lib/types";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { TaskDialog } from "../features/tasks/TaskDialog";
import { PRIORITY_COLOR, STATUS_COLOR, STATUS_LABEL, STATUS_ORDER, formatDate, isOverdue } from "../lib/utils";

function KanbanCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`cursor-pointer rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 shadow-sm hover:border-[var(--accent)] ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <p className="text-sm font-medium text-[var(--text)]">{task.title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {task.project && (
          <Badge color={task.project.color} className="text-[10px]">
            {task.project.name}
          </Badge>
        )}
        <Badge color={PRIORITY_COLOR[task.priority]} className="text-[10px]">
          {task.priority}
        </Badge>
        {task.dueDate && (
          <span
            className={`text-[10px] ${
              isOverdue(task.dueDate, task.status) ? "font-medium text-[var(--danger)]" : "text-[var(--text-faint)]"
            }`}
          >
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onAdd,
}: {
  status: string;
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  onAdd: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-[var(--bg-subtle)]">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} />
        <span className="text-sm font-medium text-[var(--text)]">{STATUS_LABEL[status]}</span>
        <span className="text-xs text-[var(--text-faint)]">{tasks.length}</span>
        <button onClick={onAdd} className="ml-auto rounded p-1 text-[var(--text-faint)] hover:bg-[var(--bg-hover)]">
          <Plus size={14} />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 overflow-y-auto rounded-b-lg p-2 pt-0 ${isOver ? "bg-[var(--bg-hover)]" : ""}`}
        style={{ minHeight: 120 }}
      >
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </div>
    </div>
  );
}

export function BoardPage() {
  const { workspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { data: tasks } = useQuery({
    queryKey: ["tasks", workspaceId, "list"],
    queryFn: () => listTasks({ workspaceId }),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragStart = (e: DragStartEvent) => {
    setActiveTask(tasks?.find((t) => t.id === e.active.id) ?? null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const task = tasks?.find((t) => t.id === active.id);
    if (task && task.status !== over.id) {
      moveMutation.mutate({ id: task.id, status: over.id as TaskStatus });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Board" subtitle="Drag tasks between columns" />
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={(tasks ?? []).filter((t) => t.status === status)}
              onTaskClick={setEditTask}
              onAdd={() => setCreateStatus(status)}
            />
          ))}
        </div>
        <DragOverlay>{activeTask && <KanbanCard task={activeTask} onClick={() => {}} />}</DragOverlay>
      </DndContext>

      <TaskDialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)} workspaceId={workspaceId} task={editTask} />
      <TaskDialog
        open={!!createStatus}
        onOpenChange={(o) => !o && setCreateStatus(null)}
        workspaceId={workspaceId}
        defaultStatus={createStatus ?? undefined}
      />
    </div>
  );
}
