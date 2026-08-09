import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ListTodo,
  Kanban,
  Calendar,
  FileText,
  Archive,
  Settings,
  Search,
  Plus,
  ChevronsUpDown,
  Check,
  Sun,
  Moon,
  Laptop,
  Folder,
} from "lucide-react";
import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { createWorkspace, listWorkspaces } from "../../lib/api";
import { useTheme } from "../../lib/theme";
import { cn } from "../../lib/utils";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { SearchPalette } from "./SearchPalette";

const WORKSPACE_COLORS = ["#6366f1", "#e5484d", "#f5a524", "#30a46c", "#0ea5e9", "#d946ef", "#f97316"];

const NAV_ITEMS = [
  { to: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "projects", label: "Projects", icon: Folder },
  { to: "tasks", label: "Tasks", icon: ListTodo },
  { to: "board", label: "Board", icon: Kanban },
  { to: "calendar", label: "Calendar", icon: Calendar },
  { to: "notes", label: "Notes", icon: FileText },
  { to: "archive", label: "Archive", icon: Archive },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(WORKSPACE_COLORS[0]);

  const { data: workspaces } = useQuery({ queryKey: ["workspaces"], queryFn: listWorkspaces });
  const current = workspaces?.find((w) => w.id === workspaceId);

  const createMutation = useMutation({
    mutationFn: () => createWorkspace({ name, color }),
    onSuccess: (ws) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setCreateOpen(false);
      setName("");
      navigate(`/w/${ws.id}/dashboard`);
    },
  });

  useKeyboardShortcut(() => setSearchOpen(true));

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-subtle)]">
      <div className="p-3">
        <RadixDropdown.Root>
          <RadixDropdown.Trigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[var(--bg-hover)]">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold text-white"
                style={{ backgroundColor: current?.color ?? "#6366f1" }}
              >
                {current?.name?.[0]?.toUpperCase() ?? "?"}
              </span>
              <span className="truncate text-sm font-medium text-[var(--text)]">
                {current?.name ?? "Select workspace"}
              </span>
              <ChevronsUpDown size={14} className="ml-auto shrink-0 text-[var(--text-faint)]" />
            </button>
          </RadixDropdown.Trigger>
          <RadixDropdown.Portal>
            <RadixDropdown.Content
              align="start"
              sideOffset={4}
              className="z-50 w-56 rounded-md border border-[var(--border)] bg-[var(--bg)] p-1 shadow-lg"
            >
              {workspaces?.map((w) => (
                <RadixDropdown.Item
                  key={w.id}
                  onSelect={() => navigate(`/w/${w.id}/dashboard`)}
                  className="flex h-8 cursor-pointer items-center gap-2 rounded px-2 text-sm outline-none data-[highlighted]:bg-[var(--bg-hover)]"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: w.color }} />
                  <span className="truncate">{w.name}</span>
                  {w.id === workspaceId && <Check size={14} className="ml-auto" />}
                </RadixDropdown.Item>
              ))}
              <div className="my-1 h-px bg-[var(--border)]" />
              <RadixDropdown.Item
                onSelect={() => setCreateOpen(true)}
                className="flex h-8 cursor-pointer items-center gap-2 rounded px-2 text-sm text-[var(--text-muted)] outline-none data-[highlighted]:bg-[var(--bg-hover)]"
              >
                <Plus size={14} />
                New workspace
              </RadixDropdown.Item>
            </RadixDropdown.Content>
          </RadixDropdown.Portal>
        </RadixDropdown.Root>
      </div>

      <button
        onClick={() => setSearchOpen(true)}
        className="mx-3 mb-2 flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text-faint)] hover:bg-[var(--bg-hover)]"
      >
        <Search size={14} />
        <span>Search...</span>
        <kbd className="ml-auto rounded border border-[var(--border)] px-1 text-[10px]">⌘K</kbd>
      </button>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={`/w/${workspaceId}/${item.to}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium",
                isActive
                  ? "bg-[var(--bg-hover)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-[var(--border)] p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium",
              isActive
                ? "bg-[var(--bg-hover)] text-[var(--text)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
            )
          }
        >
          <Settings size={16} />
          Settings
        </NavLink>
        <div className="flex items-center gap-1 px-1 pt-1">
          {(["light", "dark", "system"] as const).map((t) => {
            const Icon = t === "light" ? Sun : t === "dark" ? Moon : Laptop;
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                title={t}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md",
                  theme === t ? "bg-[var(--bg-hover)] text-[var(--text)]" : "text-[var(--text-faint)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <Icon size={14} />
              </button>
            );
          })}
          <span className="ml-auto text-[10px] text-[var(--text-faint)]">{resolvedTheme}</span>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen} title="New workspace">
        <div className="space-y-3">
          <Input autoFocus placeholder="Workspace name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            {WORKSPACE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn("h-6 w-6 rounded-full", color === c && "ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--bg)]")}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!name.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Create
            </Button>
          </div>
        </div>
      </Dialog>

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </aside>
  );
}

function useKeyboardShortcut(onTrigger: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onTrigger();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onTrigger]);
}
