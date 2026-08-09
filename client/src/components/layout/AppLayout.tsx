import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { WorkspaceProvider } from "../../lib/workspace-context";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <WorkspaceProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)]">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative h-full" onClick={(e) => e.stopPropagation()}>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3 text-[var(--text-muted)] md:hidden"
          >
            <Menu size={18} />
            <span className="text-sm font-medium">Menu</span>
          </button>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
