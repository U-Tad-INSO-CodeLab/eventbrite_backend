import { body, param } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

const NAME_MAX = 200;
const BENEFITS_MAX = 10_000;
const PRICE_MAX = 99_999_999.99;

export const validateDefaultTierBody = createValidator([
  body("name").trim().notEmpty().isLength({ max: NAME_MAX }),
  body("price")
    .trim()
    .notEmpty()
    .matches(/^\d+(\.\d{1,2})?$/)
    .toFloat()
    .isFloat({ min: 0, max: PRICE_MAX })
    .customSanitizer((v) => String(v)),
  body("benefits").trim().notEmpty().isLength({ max: BENEFITS_MAX }),
]);

export const validateDefaultTierIdParam = createValidator([
  param("id").notEmpty().isInt({ min: 1 }).toInt(),
]);
