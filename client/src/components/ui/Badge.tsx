import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={
        color
          ? { backgroundColor: `${color}1a`, color }
          : { backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }
      }
    >
      {children}
    </span>
  );
}
