import { prisma } from "@/core/prisma/client";
import { requireContextUser } from "@/modules/auth/utils/context";
import { Request, Response } from "express";
import status from "http-status";

export const listDefaultTiers = async (_req: Request, res: Response) => {
  const user = requireContextUser();
  const default_tiers = await prisma.defaultTier.findMany({
    where: { event_creator_id: user.id },
    orderBy: { id: "asc" },
  });
  res.status(status.OK).json({ default_tiers });
};

export const createDefaultTier = async (req: Request, res: Response) => {
  const user = requireContextUser();
  const { name, price, benefits } = req.body as {
    name: string;
    price: string;
    benefits: string;
  };

  const default_tier = await prisma.defaultTier.create({
    data: {
      name,
      price,
      benefits,
      event_creator_id: user.id,
    },
  });

  res.status(status.CREATED).json({ default_tier });
};

export const updateDefaultTier = async (req: Request, res: Response) => {
  const user = requireContextUser();
  const id = Number(req.params.id);
  const { name, price, benefits } = req.body as {
    name: string;
    price: string;
    benefits: string;
  };

  const existing = await prisma.defaultTier.findFirst({
    where: { id, event_creator_id: user.id },
  });

  if (!existing) {
    res.status(status.NOT_FOUND).json({ message: "Default tier not found" });
    return;
  }

  const default_tier = await prisma.defaultTier.update({
    where: { id },
    data: { name, price, benefits },
  });

  res.status(status.OK).json({ default_tier });
};

export const deleteDefaultTier = async (req: Request, res: Response) => {
  const user = requireContextUser();
  const id = Number(req.params.id);

  const existing = await prisma.defaultTier.findFirst({
    where: { id, event_creator_id: user.id },
  });

  if (!existing) {
    res.status(status.NOT_FOUND).json({ message: "Default tier not found" });
    return;
  }

  await prisma.defaultTier.delete({ where: { id } });

  res.sendStatus(status.NO_CONTENT);
};
