import { prisma } from "@/core/prisma/client";
import { requireContextUser } from "@/modules/auth/utils/context";
import { Request, Response } from "express";
import status from "http-status";

export const getProfile = async (_req: Request, res: Response) => {
  const contextUser = requireContextUser();

  const user = await prisma.user.findUnique({
    where: { id: contextUser.id },
    omit: { password: true },
  });

  if (!user) {
    res.status(status.NOT_FOUND).json({ message: "User not found" });
    return;
  }

  res.status(status.OK).json(user);
};
