import express from "express";
import { register, login } from "@/modules/auth/controllers/auth";
import { getProfile } from "@/modules/auth/controllers/profile";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { UserType } from "@/core/prisma/generated/enums";

const authRouter = express.Router();

for (const user_type of Object.values(UserType)) {
  authRouter.post(`/register/${user_type}`, register);
}
authRouter.post("/login", login);
authRouter.get("/profile", authMiddleware, getProfile);

export default authRouter;
