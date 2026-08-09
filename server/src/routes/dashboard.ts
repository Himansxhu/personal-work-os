import { Router } from "express";
import { prisma } from "../prisma.js";

export const dashboardRouter = Router();

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

dashboardRouter.get("/", async (_req, res) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const taskInclude = { workspace: true, project: true, tags: { include: { tag: true } } };
  const serialize = (t: any) => ({ ...t, tags: t.tags?.map((x: any) => x.tag) ?? [] });

  const [today, upcoming, overdue, recentlyCompleted, allActive] = await Promise.all([
    prisma.task.findMany({
      where: { archived: false, status: { not: "Done" }, dueDate: { gte: todayStart, lte: todayEnd } },
      include: taskInclude,
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      where: { archived: false, status: { not: "Done" }, dueDate: { gt: todayEnd } },
      include: taskInclude,
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    prisma.task.findMany({
      where: { archived: false, status: { not: "Done" }, dueDate: { lt: todayStart } },
      include: taskInclude,
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      where: { archived: false, status: "Done" },
      include: taskInclude,
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    prisma.task.findMany({
      where: { archived: false },
      include: { workspace: true },
    }),
  ]);

  const byWorkspace: Record<string, { workspace: any; count: number }> = {};
  const byPriority: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  for (const t of allActive) {
    const wid = t.workspaceId;
    if (!byWorkspace[wid]) byWorkspace[wid] = { workspace: t.workspace, count: 0 };
    byWorkspace[wid].count += 1;
    if (t.status !== "Done") byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
  }

  res.json({
    today: today.map(serialize),
    upcoming: upcoming.map(serialize),
    overdue: overdue.map(serialize),
    recentlyCompleted: recentlyCompleted.map(serialize),
    byWorkspace: Object.values(byWorkspace),
    byPriority,
  });
});
