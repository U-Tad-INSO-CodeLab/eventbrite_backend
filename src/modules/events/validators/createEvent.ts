import { body } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 50_000;
const LOCATION_MAX = 500;
const INDUSTRY_MAX = 200;
const TAGS_MAX = 2000;
const TARGET_AMOUNT_MAX = 99_999_999.99;

export const validateAndSanitizeCreateEvent = createValidator([
  body("title").trim().notEmpty().isLength({ max: TITLE_MAX }),
  body("description").trim().notEmpty().isLength({ max: DESCRIPTION_MAX }),
  body("date").trim().notEmpty().isISO8601(),
  body("location").trim().notEmpty().isLength({ max: LOCATION_MAX }),
  body("industry_field").trim().notEmpty().isLength({ max: INDUSTRY_MAX }),
  body("expected_attendance")
    .trim()
    .notEmpty()
    .toFloat()
    .isFloat({ min: 0 })
    .customSanitizer((v) => Math.trunc(Number(v))),
  body("target_amount")
    .customSanitizer((value, { req }) => {
      const b = req.body as Record<string, unknown>;
      if (value != null && String(value).trim() !== "") {
        return String(value).trim();
      }
      if (b.targetAmount != null) {
        return String(b.targetAmount).trim();
      }
      return value;
    })
    .trim()
    .notEmpty()
    .matches(/^\d+(\.\d{1,2})?$/)
    .toFloat()
    .isFloat({ min: 0, max: TARGET_AMOUNT_MAX })
    .customSanitizer((v) => String(v)),
  body("tags")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: TAGS_MAX })
    .customSanitizer((v) =>
      v == null || String(v).trim() === "" ? undefined : String(v).trim(),
    ),
]);
