import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Archive, Trash2, Eye, Pencil } from "lucide-react";
import { archiveNote, deleteNote, getNote, updateNote } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

export function NoteEditor({ noteId }: { noteId: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: note } = useQuery({ queryKey: ["note", noteId], queryFn: () => getNote(noteId) });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note?.id]);

  const saveMutation = useMutation({
    mutationFn: (data: { title?: string; content?: string }) => updateNote(noteId, data),
    onSuccess: () => {
      setSavedAt(new Date());
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const scheduleSave = (data: { title?: string; content?: string }) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveMutation.mutate(data), 600);
  };

  const archiveMutation = useMutation({
    mutationFn: () => archiveNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate(-1);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate(-1);
    },
  });

  if (!note) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave({ title: e.target.value });
          }}
          placeholder="Untitled"
          className="w-full bg-transparent text-lg font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
        />
        <div className="flex shrink-0 items-center gap-1">
          <span className="mr-2 text-xs text-[var(--text-faint)]">
            {saveMutation.isPending ? "Saving..." : savedAt ? "Saved" : ""}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setMode(mode === "write" ? "preview" : "write")} title="Toggle preview">
            {mode === "write" ? <Eye size={16} /> : <Pencil size={16} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => archiveMutation.mutate()} title="Archive">
            <Archive size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Delete this note permanently?")) deleteMutation.mutate();
            }}
            title="Delete"
          >
            <Trash2 size={16} className="text-[var(--danger)]" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {mode === "write" ? (
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              scheduleSave({ content: e.target.value });
            }}
            placeholder="Write in markdown..."
            className={cn(
              "h-full w-full resize-none bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]",
              "font-mono leading-relaxed"
            )}
          />
        ) : (
          <div className="prose prose-sm max-w-none text-[var(--text)] prose-headings:text-[var(--text)] prose-strong:text-[var(--text)] prose-a:text-[var(--accent)]">
            <ReactMarkdown>{content || "*Nothing to preview*"}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
