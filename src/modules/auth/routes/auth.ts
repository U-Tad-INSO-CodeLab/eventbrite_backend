import express from "express";
import { register, login } from "@/modules/auth/controllers/auth";
import { getProfile } from "@/modules/auth/controllers/profile";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { registerValidators } from "@/modules/auth/validators/register";
import { loginValidators } from "@/modules/auth/validators/login";

const authRouter = express.Router();

authRouter.post("/register/:user_type", registerValidators, register);
authRouter.post("/login", loginValidators, login);
authRouter.get("/profile", authMiddleware, getProfile);

export default authRouter;
