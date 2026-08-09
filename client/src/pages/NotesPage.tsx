import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import { useWorkspace } from "../lib/workspace-context";
import { createNote, listNotes } from "../lib/api";
import { Button } from "../components/ui/Button";
import { NoteEditor } from "../features/notes/NoteEditor";

export function NotesPage() {
  const { workspaceId } = useWorkspace();
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notes } = useQuery({
    queryKey: ["notes", workspaceId],
    queryFn: () => listNotes({ workspaceId, archived: false }),
  });

  const createMutation = useMutation({
    mutationFn: () => createNote({ workspaceId, title: "Untitled", content: "" }),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate(`/w/${workspaceId}/notes/${note.id}`);
    },
  });

  return (
    <div className="flex h-full">
      <div className="flex w-64 shrink-0 flex-col border-r border-[var(--border)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
          <span className="text-sm font-semibold text-[var(--text)]">Notes</span>
          <Button variant="ghost" size="icon" onClick={() => createMutation.mutate()}>
            <Plus size={15} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {(notes ?? []).length === 0 && (
            <p className="p-4 text-xs text-[var(--text-faint)]">No notes yet</p>
          )}
          {notes?.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(`/w/${workspaceId}/notes/${n.id}`)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--bg-subtle)] ${
                n.id === noteId ? "bg-[var(--bg-subtle)] text-[var(--text)]" : "text-[var(--text-muted)]"
              }`}
            >
              <FileText size={14} className="shrink-0" />
              <span className="truncate">{n.title || "Untitled"}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {noteId ? (
          <NoteEditor noteId={noteId} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-[var(--text-muted)]">Select a note or create a new one</p>
            <Button variant="secondary" onClick={() => createMutation.mutate()}>
              <Plus size={14} /> New note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
