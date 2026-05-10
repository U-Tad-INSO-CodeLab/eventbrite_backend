import {
  EVENT_TAGS_MAX,
  eventTagsAllowedDescription,
  isAllowedEventTag,
} from "@/modules/events/constants/eventTags";
import { NextFunction, Request, Response } from "express";
import status from "http-status";

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
  tags: string[];
};

const ALL_SENTINEL = "all";

function firstQuery(
  q: Request["query"][string],
): string | undefined {
  if (q === undefined) return undefined;
  if (Array.isArray(q)) {
    const v = q[0];
    return v != null ? String(v) : undefined;
  }
  return String(q);
}

function parseOptionalDecimal(
  raw: string | undefined,
  label: string,
  errors: string[],
): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined;
  const s = raw.trim();
  const n = Number(s);
  if (
    Number.isNaN(n) ||
    n < 0 ||
    !Number.isFinite(n) ||
    n > TARGET_AMOUNT_MAX
  ) {
    errors.push(
      `${label} must be a number between 0 and ${TARGET_AMOUNT_MAX}`,
    );
    return undefined;
  }
  if (!/^\d+(\.\d{1,2})?$/.test(s)) {
    errors.push(`${label} must have at most 2 decimal places`);
    return undefined;
  }
  return n;
}

function parseOptionalInt(
  raw: string | undefined,
  label: string,
  errors: string[],
): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined;
  const n = Number(raw.trim());
  if (
    Number.isNaN(n) ||
    !Number.isFinite(n) ||
    n < 0 ||
    !Number.isInteger(n)
  ) {
    errors.push(`${label} must be a non-negative integer`);
    return undefined;
  }
  return n;
}

function parseTagsParam(q: Request["query"]["tags"]): string[] {
  if (q === undefined) return [];
  const parts: string[] = [];
  if (Array.isArray(q)) {
    for (const item of q) {
      if (item == null) continue;
      for (const piece of String(item).split(",")) {
        const t = piece.trim();
        if (t) parts.push(t);
      }
    }
  } else {
    for (const piece of String(q).split(",")) {
      const t = piece.trim();
      if (t) parts.push(t);
    }
  }
  return parts;
}

/**
 * Validates `GET` query string for sponsor event search.
 * Sets `res.locals.sponsorEventsQuery`.
 */
export const validateQueryEvents = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors: string[] = [];

  const target_amount_from = parseOptionalDecimal(
    firstQuery(req.query.target_amount_from),
    "target_amount_from",
    errors,
  );
  const target_amount_to = parseOptionalDecimal(
    firstQuery(req.query.target_amount_to),
    "target_amount_to",
    errors,
  );

  if (
    target_amount_from != null &&
    target_amount_to != null &&
    target_amount_from > target_amount_to
  ) {
    errors.push("target_amount_from must be less than or equal to target_amount_to");
  }

  const audience_from = parseOptionalInt(
    firstQuery(req.query.audience_from),
    "audience_from",
    errors,
  );
  const audience_to = parseOptionalInt(
    firstQuery(req.query.audience_to),
    "audience_to",
    errors,
  );

  if (
    audience_from != null &&
    audience_to != null &&
    audience_from > audience_to
  ) {
    errors.push("audience_from must be less than or equal to audience_to");
  }

  const locationRaw =
    firstQuery(req.query.location) ?? ALL_SENTINEL;
  const location = String(locationRaw).trim();
  if (!location) {
    errors.push("location cannot be empty; use \"all\" for any location");
  } else if (location !== ALL_SENTINEL && location.length > LOCATION_MAX) {
    errors.push(`location must be at most ${LOCATION_MAX} characters`);
  }

  const industryRaw =
    firstQuery(req.query.industry) ?? ALL_SENTINEL;
  const industry = String(industryRaw).trim();
  if (!industry) {
    errors.push("industry cannot be empty; use \"all\" for any industry");
  } else if (industry !== ALL_SENTINEL && industry.length > INDUSTRY_MAX) {
    errors.push(`industry must be at most ${INDUSTRY_MAX} characters`);
  }

  const tagsRaw = parseTagsParam(req.query.tags);
  const tags = [...new Set(tagsRaw)];
  if (tags.length > EVENT_TAGS_MAX) {
    errors.push(`at most ${EVENT_TAGS_MAX} distinct tags are allowed`);
  }
  const invalidTags = tags.filter((t) => !isAllowedEventTag(t));
  if (invalidTags.length > 0) {
    errors.push(
      `unknown tags: ${invalidTags.join(", ")}. Allowed: ${eventTagsAllowedDescription()}`,
    );
  }

  const pageRaw = firstQuery(req.query.page);
  let page = 1;
  if (pageRaw !== undefined && String(pageRaw).trim() !== "") {
    const n = Number(String(pageRaw).trim());
    if (
      Number.isNaN(n) ||
      !Number.isFinite(n) ||
      !Number.isInteger(n) ||
      n < 1
    ) {
      errors.push("page must be a positive integer");
    } else {
      page = n;
    }
  }

  if (errors.length > 0) {
    res.status(status.BAD_REQUEST).json({
      status: status.BAD_REQUEST,
      message: errors,
    });
    return;
  }

  const sponsorEventsQuery: SponsorEventsQuery = {
    page,
    ...(target_amount_from != null ? { target_amount_from } : {}),
    ...(target_amount_to != null ? { target_amount_to } : {}),
    ...(audience_from != null ? { audience_from } : {}),
    ...(audience_to != null ? { audience_to } : {}),
    location,
    industry,
    tags,
  };

  res.locals.sponsorEventsQuery = sponsorEventsQuery;
  next();
};

declare global {
  namespace Express {
    interface Locals {
      sponsorEventsQuery?: SponsorEventsQuery;
    }
  }
}
