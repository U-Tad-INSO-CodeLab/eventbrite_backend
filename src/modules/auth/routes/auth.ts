import express from "express";
import { register, login } from "@/modules/auth/controllers/auth";
import { getProfile } from "@/modules/auth/controllers/profile";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { validateRegister } from "@/modules/auth/validators/register";
import { validateLogin } from "@/modules/auth/validators/login";

const authRouter = express.Router();

authRouter.post("/register/:user_type", validateRegister, register);
authRouter.post("/login", validateLogin, login);
authRouter.get("/profile", authMiddleware, getProfile);

export default authRouter;
