import { body } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

export const registerValidators = createValidator([
  body("username")
    .trim()
    .notEmpty()
    .withMessage("This field is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Must be 3 to 30 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("This field is required")
    .isEmail()
    .withMessage("Must be a valid email"),

  body("password")
    .notEmpty()
    .withMessage("This field is required")
    .isLength({ min: 6 })
    .withMessage("Must be at least 6 characters"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("This field is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Must match password"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("This field is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Must be at most 50 characters"),

  body("surname")
    .trim()
    .notEmpty()
    .withMessage("This field is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Must be at most 50 characters"),
]);
