import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { RootRedirect } from "./pages/RootRedirect";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { TasksListPage } from "./pages/TasksListPage";
import { BoardPage } from "./pages/BoardPage";
import { CalendarPage } from "./pages/CalendarPage";
import { NotesPage } from "./pages/NotesPage";
import { ArchivePage } from "./pages/ArchivePage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<AppLayout />}>
          <Route path="/w/:workspaceId/dashboard" element={<DashboardPage />} />
          <Route path="/w/:workspaceId/projects" element={<ProjectsPage />} />
          <Route path="/w/:workspaceId/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/w/:workspaceId/tasks" element={<TasksListPage />} />
          <Route path="/w/:workspaceId/board" element={<BoardPage />} />
          <Route path="/w/:workspaceId/calendar" element={<CalendarPage />} />
          <Route path="/w/:workspaceId/notes" element={<NotesPage />} />
          <Route path="/w/:workspaceId/notes/:noteId" element={<NotesPage />} />
          <Route path="/w/:workspaceId/archive" element={<ArchivePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
