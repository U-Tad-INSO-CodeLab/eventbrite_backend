import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "@/core/prisma/client";
import { UserType } from "@/core/prisma/generated/client";
import { view } from "@/modules/admin/views/resolve";

const authRouter = Router();

authRouter.get("/login", (req, res) => {
  if (req.session.adminUser) return res.redirect("/admin");
  res.render(view("login"), { layout: false, error: null });
});

authRouter.post("/login", async (req, res) => {
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
});

authRouter.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

export { authRouter };
