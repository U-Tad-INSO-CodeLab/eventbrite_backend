import { body } from "express-validator";
import { createValidator } from "@/core/middleware/validation";
import {
  EVENT_TAG_OPTIONS,
  EVENT_TAGS_MAX,
  eventTagsAllowedDescription,
  isAllowedEventTag,
} from "@/modules/events/constants/eventTags";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 50_000;
const LOCATION_MAX = 500;
const INDUSTRY_MAX = 200;
const TARGET_AMOUNT_MAX = 99_999_999.99;

const TAG_ORDER = new Map<string, number>(
  EVENT_TAG_OPTIONS.map((t, i) => [t, i]),
);

function normalizeTagsField(raw: string): string | undefined {
  const tokens = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const unique = [...new Set(tokens)];
  if (unique.length === 0) return undefined;
  unique.sort((a, b) => (TAG_ORDER.get(a) ?? 0) - (TAG_ORDER.get(b) ?? 0));
  return unique.join(", ");
}

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
    .customSanitizer((v) =>
      v == null || String(v).trim() === "" ? undefined : String(v).trim(),
    )
    .custom((value) => {
      if (value === undefined) return true;
      const tokens = String(value)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const unique = [...new Set(tokens)];
      if (unique.length > EVENT_TAGS_MAX) {
        throw new Error(`at most ${EVENT_TAGS_MAX} distinct tags are allowed`);
      }
      const invalid = unique.filter((t) => !isAllowedEventTag(t));
      if (invalid.length > 0) {
        throw new Error(
          `unknown tags: ${invalid.join(", ")}. Allowed: ${eventTagsAllowedDescription()}`,
        );
      }
      return true;
    })
    .customSanitizer((value) =>
      value === undefined ? undefined : normalizeTagsField(String(value)),
    ),
]);
