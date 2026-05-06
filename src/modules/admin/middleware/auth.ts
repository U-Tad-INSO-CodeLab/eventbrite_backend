import { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    adminUser?: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session.adminUser) return next();
  res.redirect("/admin/login");
}
