import { body } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

export const registerValidators = createValidator([
  body("username").trim().notEmpty().isLength({ min: 3, max: 30 }),
  body("email").trim().notEmpty().isEmail(),
  body("password").notEmpty().isLength({ min: 6 }),
  body("confirmPassword").notEmpty(),
  body("name").trim().notEmpty().isLength({ min: 1, max: 50 }),
  body("surname").trim().notEmpty().isLength({ min: 1, max: 50 }),
]);
