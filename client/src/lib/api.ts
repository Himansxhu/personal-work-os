import type { DashboardData, Note, Project, Settings, Tag, Task, Workspace } from "./types";

const BASE = "/api";

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Workspaces
export const listWorkspaces = () => request<Workspace[]>("/workspaces");
export const getWorkspace = (id: string) => request<Workspace>(`/workspaces/${id}`);
export const createWorkspace = (data: Partial<Workspace>) =>
  request<Workspace>("/workspaces", { method: "POST", body: JSON.stringify(data) });
export const updateWorkspace = (id: string, data: Partial<Workspace>) =>
  request<Workspace>(`/workspaces/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteWorkspace = (id: string) => request<void>(`/workspaces/${id}`, { method: "DELETE" });

// Projects
export const listProjects = (params?: { workspaceId?: string; status?: string }) =>
  request<Project[]>(`/projects${toQuery(params)}`);
export const getProject = (id: string) => request<Project>(`/projects/${id}`);
export const createProject = (data: Partial<Project>) =>
  request<Project>("/projects", { method: "POST", body: JSON.stringify(data) });
export const updateProject = (id: string, data: Partial<Project>) =>
  request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteProject = (id: string) => request<void>(`/projects/${id}`, { method: "DELETE" });

// Tasks
export interface TaskFilters {
  workspaceId?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  archived?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  search?: string;
}
export const listTasks = (filters?: TaskFilters) =>
  request<Task[]>(`/tasks${toQuery(filters as Record<string, unknown>)}`);
export const getTask = (id: string) => request<Task>(`/tasks/${id}`);
type TaskInput = Partial<Omit<Task, "tags">> & { tags?: string[] };
export const createTask = (data: TaskInput) =>
  request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) });
export const updateTask = (id: string, data: TaskInput) =>
  request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteTask = (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" });
export const duplicateTask = (id: string) => request<Task>(`/tasks/${id}/duplicate`, { method: "POST" });
export const archiveTask = (id: string) => request<Task>(`/tasks/${id}/archive`, { method: "POST" });
export const restoreTask = (id: string) => request<Task>(`/tasks/${id}/restore`, { method: "POST" });
export const completeTask = (id: string) => request<Task>(`/tasks/${id}/complete`, { method: "POST" });

// Tags
export const listTags = () => request<Tag[]>("/tags");

// Notes
export const listNotes = (params?: { workspaceId?: string; archived?: boolean }) =>
  request<Note[]>(`/notes${toQuery(params)}`);
export const getNote = (id: string) => request<Note>(`/notes/${id}`);
export const createNote = (data: Partial<Note>) =>
  request<Note>("/notes", { method: "POST", body: JSON.stringify(data) });
export const updateNote = (id: string, data: Partial<Note>) =>
  request<Note>(`/notes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteNote = (id: string) => request<void>(`/notes/${id}`, { method: "DELETE" });
export const archiveNote = (id: string) => request<Note>(`/notes/${id}/archive`, { method: "POST" });
export const restoreNote = (id: string) => request<Note>(`/notes/${id}/restore`, { method: "POST" });

// Settings
export const getSettings = () => request<Settings>("/settings");
export const updateSettings = (data: Partial<Settings>) =>
  request<Settings>("/settings", { method: "PATCH", body: JSON.stringify(data) });

// Search
export const globalSearch = (q: string) =>
  request<{ workspaces: Workspace[]; projects: Project[]; tasks: Task[]; notes: Note[] }>(
    `/search?q=${encodeURIComponent(q)}`
  );

// Dashboard
export const getDashboard = () => request<DashboardData>("/dashboard");
