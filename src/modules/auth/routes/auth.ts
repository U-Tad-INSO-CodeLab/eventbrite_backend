import express from "express";
import { register, login } from "@/modules/auth/controllers/auth";
import { getProfile } from "@/modules/auth/controllers/profile";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { UserType } from "@/core/prisma/generated/enums";

const router = express.Router();

for (const user_type of Object.values(UserType)) {
  router.post(`/register/${user_type}`, register);
}
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

export default router;
