import { Router } from "express";
import { prisma } from "../prisma.js";

export const projectsRouter = Router();

projectsRouter.get("/", async (req, res) => {
  const { workspaceId, status } = req.query;
  const projects = await prisma.project.findMany({
    where: {
      ...(workspaceId ? { workspaceId: String(workspaceId) } : {}),
      ...(status ? { status: String(status) } : {}),
    },
    include: { _count: { select: { tasks: { where: { archived: false } } } } },
    orderBy: { createdAt: "asc" },
  });
  res.json(projects);
});

projectsRouter.get("/:id", async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

projectsRouter.post("/", async (req, res) => {
  const { workspaceId, name, description, color } = req.body;
  if (!workspaceId) return res.status(400).json({ error: "workspaceId is required" });
  if (!name || !String(name).trim()) return res.status(400).json({ error: "Name is required" });
  const project = await prisma.project.create({
    data: {
      workspaceId,
      name: name.trim(),
      description: description ?? "",
      color: color ?? "#6366f1",
    },
  });
  res.status(201).json(project);
});

projectsRouter.patch("/:id", async (req, res) => {
  const { name, description, color, status } = req.body;
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });
  res.json(project);
});

projectsRouter.delete("/:id", async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
