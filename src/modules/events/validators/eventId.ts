import { param } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

export const validateEventIdParam = createValidator([
  param("id").notEmpty().isInt({ min: 1 }).toInt(),
]);
