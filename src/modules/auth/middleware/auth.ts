import { verifyToken } from "@/modules/auth/utils/jwt";
import { setContextUser } from "@/modules/auth/utils/context";
import { NextFunction, Request, Response } from "express";
import status from "http-status";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    setContextUser(verifyToken(token));
    next();
  } catch {
    res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
  }
};
