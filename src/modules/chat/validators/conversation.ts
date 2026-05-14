import { body } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

export const initializeConversationValidators = createValidator([
  body("event_id")
    .notEmpty()
    .withMessage("This field is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Must be a positive integer")
    .toInt(),
]);
