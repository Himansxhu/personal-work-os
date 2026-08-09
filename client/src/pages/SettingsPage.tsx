import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { deleteWorkspace, listWorkspaces, updateWorkspace, getSettings, updateSettings } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useTheme } from "../lib/theme";

const WORKSPACE_COLORS = ["#6366f1", "#e5484d", "#f5a524", "#30a46c", "#0ea5e9", "#d946ef", "#f97316"];

export function SettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data: workspaces } = useQuery({ queryKey: ["workspaces"], queryFn: listWorkspaces });

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  useEffect(() => {
    if (settings) {
      setProfileName(settings.profileName);
      setProfileEmail(settings.profileEmail);
    }
  }, [settings?.id]);

  const saveProfile = useMutation({
    mutationFn: () => updateSettings({ profileName, profileEmail }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  const colorMutation = useMutation({
    mutationFn: ({ id, color }: { id: string; color: string }) => updateWorkspace(id, { color }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      navigate("/");
    },
  });

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader title="Settings" subtitle="Profile, theme, and workspace preferences" />

      <div className="mx-auto max-w-2xl space-y-8 p-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Profile</h2>
          <div className="space-y-3 rounded-lg border border-[var(--border)] p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Name</label>
              <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Email</label>
              <Input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <Button variant="primary" size="sm" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
              Save profile
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Theme</h2>
          <div className="flex gap-2 rounded-lg border border-[var(--border)] p-4">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button key={t} variant={theme === t ? "primary" : "secondary"} size="sm" onClick={() => setTheme(t)}>
                {t[0].toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Workspace colors</h2>
          <div className="space-y-2 rounded-lg border border-[var(--border)] p-4">
            {workspaces?.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 py-1">
                <span className="text-sm text-[var(--text)]">{w.name}</span>
                <div className="flex items-center gap-2">
                  {WORKSPACE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => colorMutation.mutate({ id: w.id, color: c })}
                      className={`h-5 w-5 rounded-full ${w.color === c ? "ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--bg)]" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete workspace"
                    onClick={() => {
                      if (confirm(`Delete workspace "${w.name}" and everything in it? This cannot be undone.`)) {
                        deleteMutation.mutate(w.id);
                      }
                    }}
                  >
                    <Trash2 size={14} className="text-[var(--danger)]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
