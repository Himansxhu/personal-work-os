import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRIORITY_ORDER = ["High", "Medium", "Low"] as const;
export const STATUS_ORDER = ["Todo", "InProgress", "Review", "Blocked", "Done"] as const;

export const STATUS_LABEL: Record<string, string> = {
  Todo: "Todo",
  InProgress: "In Progress",
  Review: "Review",
  Blocked: "Blocked",
  Done: "Done",
};

export const PRIORITY_COLOR: Record<string, string> = {
  High: "#e5484d",
  Medium: "#f5a524",
  Low: "#30a46c",
};

export const STATUS_COLOR: Record<string, string> = {
  Todo: "#9a9aa2",
  InProgress: "#6366f1",
  Review: "#f5a524",
  Blocked: "#e5484d",
  Done: "#30a46c",
};

export function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function isOverdue(dateStr: string | null | undefined, status: string) {
  if (!dateStr || status === "Done") return false;
  return new Date(dateStr).getTime() < new Date(new Date().setHours(0, 0, 0, 0)).getTime();
}
