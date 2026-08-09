import { Router } from "express";
import { prisma } from "../prisma.js";

export const workspacesRouter = Router();

workspacesRouter.get("/", async (_req, res) => {
  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { projects: true, tasks: { where: { archived: false } } } },
    },
  });
  res.json(workspaces);
});

workspacesRouter.get("/:id", async (req, res) => {
  const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
  if (!workspace) return res.status(404).json({ error: "Workspace not found" });
  res.json(workspace);
});

workspacesRouter.post("/", async (req, res) => {
  const { name, color, icon } = req.body;
  if (!name || !String(name).trim()) return res.status(400).json({ error: "Name is required" });
  const workspace = await prisma.workspace.create({
    data: { name: name.trim(), color: color ?? "#6366f1", icon: icon ?? "Folder" },
  });
  res.status(201).json(workspace);
});

workspacesRouter.patch("/:id", async (req, res) => {
  const { name, color, icon } = req.body;
  const workspace = await prisma.workspace.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(icon !== undefined ? { icon } : {}),
    },
  });
  res.json(workspace);
});

workspacesRouter.delete("/:id", async (req, res) => {
  await prisma.workspace.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
