import { Router } from "express";
import { prisma } from "../prisma.js";

export const notesRouter = Router();

notesRouter.get("/", async (req, res) => {
  const { workspaceId, archived } = req.query;
  const notes = await prisma.note.findMany({
    where: {
      ...(workspaceId ? { workspaceId: String(workspaceId) } : {}),
      archived: archived === "true",
    },
    orderBy: { updatedAt: "desc" },
  });
  res.json(notes);
});

notesRouter.get("/:id", async (req, res) => {
  const note = await prisma.note.findUnique({ where: { id: req.params.id } });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

notesRouter.post("/", async (req, res) => {
  const { workspaceId, title, content } = req.body;
  if (!workspaceId) return res.status(400).json({ error: "workspaceId is required" });
  const note = await prisma.note.create({
    data: { workspaceId, title: title?.trim() || "Untitled", content: content ?? "" },
  });
  res.status(201).json(note);
});

notesRouter.patch("/:id", async (req, res) => {
  const { title, content } = req.body;
  const note = await prisma.note.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined ? { title: String(title).trim() || "Untitled" } : {}),
      ...(content !== undefined ? { content } : {}),
    },
  });
  res.json(note);
});

notesRouter.delete("/:id", async (req, res) => {
  await prisma.note.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

notesRouter.post("/:id/archive", async (req, res) => {
  const note = await prisma.note.update({ where: { id: req.params.id }, data: { archived: true } });
  res.json(note);
});

notesRouter.post("/:id/restore", async (req, res) => {
  const note = await prisma.note.update({ where: { id: req.params.id }, data: { archived: false } });
  res.json(note);
});
