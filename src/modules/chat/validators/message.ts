import { body } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

export const messageValidators = createValidator([
  body("message").trim().notEmpty().withMessage("This field is required"),
]);
