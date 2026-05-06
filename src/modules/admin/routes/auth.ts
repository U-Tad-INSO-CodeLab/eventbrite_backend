import { Router } from "express";
import { getLogin, postLogin, logout } from "@/modules/admin/controllers/auth";

const authRouter = Router();

authRouter.get("/login", getLogin);
authRouter.post("/login", postLogin);
authRouter.get("/logout", logout);

export { authRouter };
