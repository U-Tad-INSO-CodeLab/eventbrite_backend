import { body } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

export const loginValidators = createValidator([
  body("username").trim().notEmpty().withMessage("This field is required"),
  body("password").notEmpty().withMessage("This field is required"),
]);
