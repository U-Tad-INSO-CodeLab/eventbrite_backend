import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "@/core/prisma/client";
import { UserType } from "@/core/prisma/generated/client";
import { view } from "@/modules/admin/views/resolve";

export function getLogin(req: Request, res: Response): void {
  if (req.session.adminUser) {
    res.redirect("/admin");
    return;
  }
  res.render(view("login"), { layout: false, error: null });
}

export async function postLogin(req: Request, res: Response): Promise<void> {
  const { email: credential, password } = req.body as {
    email: string;
    password: string;
  };

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: credential }, { username: credential }],
      user_type: UserType.admin,
      enabled: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.render(view("login"), { layout: false, error: "Invalid email or password" });
    return;
  }

  req.session.adminUser = user.email;
  res.redirect("/admin");
}

export function logout(req: Request, res: Response): void {
  req.session.destroy(() => res.redirect("/admin/login"));
}
