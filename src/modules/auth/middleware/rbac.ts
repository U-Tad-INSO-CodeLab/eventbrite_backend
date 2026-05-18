import { requireContextUser } from "@/modules/auth/utils/context";
import { UserType } from "@/core/prisma/generated/client";
import { RequestHandler } from "express";
import status from "http-status";

export type RequireRolesOptions = {
  forbiddenMessage?: string;
};

export function requireRoles(
  allowed: readonly UserType[],
  options?: RequireRolesOptions,
): RequestHandler {
  const forbiddenMessage = options?.forbiddenMessage ?? "Forbidden";
  const allowedSet = new Set(allowed);

  return (_req, res, next) => {
    let user;
    try {
      user = requireContextUser();
    } catch {
      res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }
    if (!allowedSet.has(user.user_type)) {
      res.status(status.FORBIDDEN).json({ message: forbiddenMessage });
      return;
    }
    next();
  };
}

export const requireCreator = requireRoles([UserType.creator], {
  forbiddenMessage: "Creator access required",
});

export const requireSponsor = requireRoles([UserType.sponsor], {
  forbiddenMessage: "Sponsor or admin access required",
});

export const requireAdmin = requireRoles([UserType.admin], {
  forbiddenMessage: "Admin access required",
});
