import { body } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

export const loginValidators = createValidator([
  body("username").trim().notEmpty(),
  body("password").notEmpty(),
]);
