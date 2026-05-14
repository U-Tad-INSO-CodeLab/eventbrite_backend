import { query } from "express-validator";
import { createValidator } from "@/core/middleware/validation";
import {
  EVENT_TAGS_MAX,
  eventTagsAllowedDescription,
  isAllowedEventTag,
} from "@/modules/events/constants/eventTags";

const LOCATION_MAX = 500;
const INDUSTRY_MAX = 200;
const TARGET_AMOUNT_MAX = 99_999_999.99;

/** Fixed page size for sponsor event search (`GET /query`). */
export const SPONSOR_EVENTS_PAGE_SIZE = 12;

export type SponsorEventsQuery = {
  page: number;
  target_amount_from?: number;
  target_amount_to?: number;
  audience_from?: number;
  audience_to?: number;
  location: string;
  industry: string;
  tags?: string[];
};

const ALL_SENTINEL = "all";

function singleQueryValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) {
    const first = value[0];
    return first != null ? String(first) : "";
  }
  return String(value);
}

export const validateQueryEvents = createValidator([
  query("target_amount_from")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage(
      `target_amount_from must have at most 2 decimal places and be between 0 and ${TARGET_AMOUNT_MAX}`,
    )
    .toFloat()
    .isFloat({ min: 0, max: TARGET_AMOUNT_MAX })
    .withMessage(
      `target_amount_from must be a number between 0 and ${TARGET_AMOUNT_MAX}`,
    ),

  query("target_amount_to")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage(
      `target_amount_to must have at most 2 decimal places and be between 0 and ${TARGET_AMOUNT_MAX}`,
    )
    .toFloat()
    .isFloat({ min: 0, max: TARGET_AMOUNT_MAX })
    .withMessage(
      `target_amount_to must be a number between 0 and ${TARGET_AMOUNT_MAX}`,
    )
    .custom((to, { req }) => {
      const fromStr = singleQueryValue(req.query?.target_amount_from).trim();
      if (fromStr === "") return true;
      const fromNum = Number(fromStr);
      if (Number.isNaN(fromNum)) return true;
      if (fromNum > Number(to)) {
        throw new Error(
          "target_amount_from must be less than or equal to target_amount_to",
        );
      }
      return true;
    }),

  query("audience_from")
    .optional({ values: "falsy" })
    .trim()
    .toInt()
    .isInt({ min: 0 })
    .withMessage("audience_from must be a non-negative integer"),

  query("audience_to")
    .optional({ values: "falsy" })
    .trim()
    .toInt()
    .isInt({ min: 0 })
    .withMessage("audience_to must be a non-negative integer")
    .custom((to, { req }) => {
      const fromStr = singleQueryValue(req.query?.audience_from).trim();
      if (fromStr === "") return true;
      const fromNum = Number.parseInt(fromStr, 10);
      if (Number.isNaN(fromNum)) return true;
      if (fromNum > Number(to)) {
        throw new Error(
          "audience_from must be less than or equal to audience_to",
        );
      }
      return true;
    }),

  query("location")
    .customSanitizer((v) => {
      const s = singleQueryValue(v).trim();
      return s === "" ? ALL_SENTINEL : s;
    })
    .notEmpty()
    .withMessage('location cannot be empty; use "all" for any location')
    .isLength({ max: LOCATION_MAX })
    .withMessage(`location must be at most ${LOCATION_MAX} characters`),

  query("industry")
    .customSanitizer((v) => {
      const s = singleQueryValue(v).trim();
      return s === "" ? ALL_SENTINEL : s;
    })
    .notEmpty()
    .withMessage('industry cannot be empty; use "all" for any industry')
    .isLength({ max: INDUSTRY_MAX })
    .withMessage(`industry must be at most ${INDUSTRY_MAX} characters`),

  query("tags")
    .optional({ values: "falsy" })
    .customSanitizer((v) => {
      const raw = Array.isArray(v)
        ? v.map((x) => String(x)).join(",")
        : singleQueryValue(v);
      const parts = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return [...new Set(parts)] as string[];
    })
    .custom((tags: string[]) => {
      if (tags.length > EVENT_TAGS_MAX) {
        throw new Error(`at most ${EVENT_TAGS_MAX} distinct tags are allowed`);
      }
      const invalid = tags.filter((t) => !isAllowedEventTag(t));
      if (invalid.length > 0) {
        throw new Error(
          `unknown tags: ${invalid.join(", ")}. Allowed: ${eventTagsAllowedDescription()}`,
        );
      }
      return true;
    }),

  query("page")
    .customSanitizer((v) => {
      const s = singleQueryValue(v).trim();
      return s === "" ? "1" : s;
    })
    .toInt()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
]);
