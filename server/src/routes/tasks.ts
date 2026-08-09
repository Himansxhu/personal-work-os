import { Router } from "express";
import { prisma } from "../prisma.js";

export const tasksRouter = Router();

const taskInclude = {
  tags: { include: { tag: true } },
  project: true,
  workspace: true,
};

function serializeTask(task: any) {
  return {
    ...task,
    tags: task.tags?.map((t: any) => t.tag) ?? [],
  };
}

async function setTags(taskId: string, tagNames: string[] | undefined) {
  if (tagNames === undefined) return;
  await prisma.taskTag.deleteMany({ where: { taskId } });
  for (const rawName of tagNames) {
    const name = rawName.trim();
    if (!name) continue;
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    await prisma.taskTag.create({ data: { taskId, tagId: tag.id } }).catch(() => {});
  }
}

tasksRouter.get("/", async (req, res) => {
  const { workspaceId, projectId, status, priority, archived, dueBefore, dueAfter, search } = req.query;
  const tasks = await prisma.task.findMany({
    where: {
      ...(workspaceId ? { workspaceId: String(workspaceId) } : {}),
      ...(projectId ? { projectId: String(projectId) } : {}),
      ...(status ? { status: String(status) } : {}),
      ...(priority ? { priority: String(priority) } : {}),
      archived: archived === "true" ? true : archived === "false" ? false : false,
      ...(dueBefore || dueAfter
        ? {
            dueDate: {
              ...(dueBefore ? { lte: new Date(String(dueBefore)) } : {}),
              ...(dueAfter ? { gte: new Date(String(dueAfter)) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: String(search) } },
              { description: { contains: String(search) } },
            ],
          }
        : {}),
    },
    include: taskInclude,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  res.json(tasks.map(serializeTask));
});

tasksRouter.get("/:id", async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id }, include: taskInclude });
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(serializeTask(task));
});

tasksRouter.post("/", async (req, res) => {
  const { workspaceId, projectId, title, description, notes, priority, status, dueDate, tags } = req.body;
  if (!workspaceId) return res.status(400).json({ error: "workspaceId is required" });
  if (!title || !String(title).trim()) return res.status(400).json({ error: "Title is required" });

  const task = await prisma.task.create({
    data: {
      workspaceId,
      projectId: projectId || null,
      title: title.trim(),
      description: description ?? "",
      notes: notes ?? "",
      priority: priority ?? "Medium",
      status: status ?? "Todo",
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  await setTags(task.id, tags);
  const full = await prisma.task.findUnique({ where: { id: task.id }, include: taskInclude });
  res.status(201).json(serializeTask(full));
});

tasksRouter.patch("/:id", async (req, res) => {
  const { projectId, title, description, notes, priority, status, dueDate, tags, order } = req.body;
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const data: any = {
    ...(projectId !== undefined ? { projectId: projectId || null } : {}),
    ...(title !== undefined ? { title: String(title).trim() } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(priority !== undefined ? { priority } : {}),
    ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    ...(order !== undefined ? { order } : {}),
  };

  if (status !== undefined) {
    data.status = status;
    data.completedAt = status === "Done" ? new Date() : null;
  }

  const task = await prisma.task.update({ where: { id: req.params.id }, data });
  await setTags(task.id, tags);
  const full = await prisma.task.findUnique({ where: { id: task.id }, include: taskInclude });
  res.json(serializeTask(full));
});

tasksRouter.delete("/:id", async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

tasksRouter.post("/:id/duplicate", async (req, res) => {
  const original = await prisma.task.findUnique({ where: { id: req.params.id }, include: taskInclude });
  if (!original) return res.status(404).json({ error: "Task not found" });

  const copy = await prisma.task.create({
    data: {
      workspaceId: original.workspaceId,
      projectId: original.projectId,
      title: `${original.title} (copy)`,
      description: original.description,
      notes: original.notes,
      priority: original.priority,
      status: "Todo",
      dueDate: original.dueDate,
    },
  });
  await setTags(copy.id, original.tags.map((t: any) => t.tag.name));
  const full = await prisma.task.findUnique({ where: { id: copy.id }, include: taskInclude });
  res.status(201).json(serializeTask(full));
});

tasksRouter.post("/:id/archive", async (req, res) => {
  const task = await prisma.task.update({ where: { id: req.params.id }, data: { archived: true } });
  res.json(task);
});

tasksRouter.post("/:id/restore", async (req, res) => {
  const task = await prisma.task.update({ where: { id: req.params.id }, data: { archived: false } });
  res.json(task);
});

tasksRouter.post("/:id/complete", async (req, res) => {
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status: "Done", completedAt: new Date() },
  });
  res.json(task);
});
