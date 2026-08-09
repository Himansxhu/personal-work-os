import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Search, Folder, ListTodo, FileText, LayoutGrid } from "lucide-react";
import { globalSearch } from "../../lib/api";

export function SearchPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["search", q],
    queryFn: () => globalSearch(q),
    enabled: q.trim().length > 0,
  });

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const hasResults =
    data && (data.workspaces.length || data.projects.length || data.tasks.length || data.notes.length);

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <RadixDialog.Content
          className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--bg)] shadow-xl focus:outline-none"
        >
          <RadixDialog.Title className="sr-only">Search</RadixDialog.Title>
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
            <Search size={16} className="text-[var(--text-faint)]" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tasks, projects, workspaces, notes..."
              className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
            />
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {!q.trim() && (
              <p className="px-2 py-6 text-center text-sm text-[var(--text-faint)]">
                Start typing to search everything
              </p>
            )}
            {q.trim() && !hasResults && (
              <p className="px-2 py-6 text-center text-sm text-[var(--text-faint)]">No results</p>
            )}
            {data?.workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => go(`/w/${w.id}/dashboard`)}
                className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-[var(--bg-hover)]"
              >
                <LayoutGrid size={14} style={{ color: w.color }} />
                <span>{w.name}</span>
                <span className="ml-auto text-xs text-[var(--text-faint)]">Workspace</span>
              </button>
            ))}
            {data?.projects.map((p) => (
              <button
                key={p.id}
                onClick={() => go(`/w/${p.workspaceId}/projects/${p.id}`)}
                className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-[var(--bg-hover)]"
              >
                <Folder size={14} style={{ color: p.color }} />
                <span>{p.name}</span>
                <span className="ml-auto text-xs text-[var(--text-faint)]">Project</span>
              </button>
            ))}
            {data?.tasks.map((t) => (
              <button
                key={t.id}
                onClick={() => go(`/w/${t.workspaceId}/tasks?task=${t.id}`)}
                className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-[var(--bg-hover)]"
              >
                <ListTodo size={14} className="text-[var(--text-faint)]" />
                <span className="truncate">{t.title}</span>
                <span className="ml-auto shrink-0 text-xs text-[var(--text-faint)]">Task</span>
              </button>
            ))}
            {data?.notes.map((n) => (
              <button
                key={n.id}
                onClick={() => go(`/w/${n.workspaceId}/notes/${n.id}`)}
                className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-[var(--bg-hover)]"
              >
                <FileText size={14} className="text-[var(--text-faint)]" />
                <span className="truncate">{n.title}</span>
                <span className="ml-auto shrink-0 text-xs text-[var(--text-faint)]">Note</span>
              </button>
            ))}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
