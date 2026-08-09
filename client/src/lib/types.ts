export type Priority = "High" | "Medium" | "Low";
export type TaskStatus = "Todo" | "InProgress" | "Review" | "Blocked" | "Done";

export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number; tasks: number };
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  color: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string | null;
  title: string;
  description: string;
  notes: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  archived: boolean;
  order: number;
  tags: Tag[];
  workspace?: Workspace;
  project?: Project | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  workspace?: Workspace;
}

export interface Settings {
  id: number;
  theme: "light" | "dark" | "system";
  profileName: string;
  profileEmail: string;
}

export interface DashboardData {
  today: Task[];
  upcoming: Task[];
  overdue: Task[];
  recentlyCompleted: Task[];
  byWorkspace: { workspace: Workspace; count: number }[];
  byPriority: Record<Priority, number>;
}
