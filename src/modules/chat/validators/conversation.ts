import { body } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

export const initializeConversationValidators = createValidator([
  body("event_id").notEmpty().bail().isInt({ min: 1 }).toInt(),
]);
