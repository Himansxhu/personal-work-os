import { Router } from "express";
import { prisma } from "../prisma.js";

export const settingsRouter = Router();

async function getOrCreateSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

settingsRouter.get("/", async (_req, res) => {
  res.json(await getOrCreateSettings());
});

settingsRouter.patch("/", async (req, res) => {
  await getOrCreateSettings();
  const { theme, profileName, profileEmail } = req.body;
  const settings = await prisma.settings.update({
    where: { id: 1 },
    data: {
      ...(theme !== undefined ? { theme } : {}),
      ...(profileName !== undefined ? { profileName } : {}),
      ...(profileEmail !== undefined ? { profileEmail } : {}),
    },
  });
  res.json(settings);
});
