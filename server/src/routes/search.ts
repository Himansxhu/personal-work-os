import { Router } from "express";
import { prisma } from "../prisma.js";

export const searchRouter = Router();

searchRouter.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.json({ workspaces: [], projects: [], tasks: [], notes: [] });

  const [workspaces, projects, tasks, notes] = await Promise.all([
    prisma.workspace.findMany({ where: { name: { contains: q } }, take: 5 }),
    prisma.project.findMany({ where: { name: { contains: q } }, take: 5, include: { workspace: true } }),
    prisma.task.findMany({
      where: {
        archived: false,
        OR: [{ title: { contains: q } }, { description: { contains: q } }],
      },
      take: 8,
      include: { workspace: true, project: true },
    }),
    prisma.note.findMany({
      where: {
        archived: false,
        OR: [{ title: { contains: q } }, { content: { contains: q } }],
      },
      take: 5,
      include: { workspace: true },
    }),
  ]);

  res.json({ workspaces, projects, tasks, notes });
});
