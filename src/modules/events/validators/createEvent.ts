import { NextFunction, Request, Response } from "express";
import status from "http-status";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 50_000;
const LOCATION_MAX = 500;
const INDUSTRY_MAX = 200;
const TAGS_MAX = 2000;

/**
 * Validates `multipart/form-data` body fields (all string values from Multer).
 */
export const validateCreateEventMultipart = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const b = req.body as Record<string, string | undefined>;
  const errors: string[] = [];

  const title = b.title != null ? String(b.title).trim() : "";
  if (!title) errors.push("title is required");
  else if (title.length > TITLE_MAX)
    errors.push(`title must be at most ${TITLE_MAX} characters`);

  const description = b.description != null ? String(b.description).trim() : "";
  if (!description) errors.push("description is required");
  else if (description.length > DESCRIPTION_MAX)
    errors.push(`description must be at most ${DESCRIPTION_MAX} characters`);

  const dateRaw = b.date != null ? String(b.date).trim() : "";
  const date = dateRaw ? new Date(dateRaw) : new Date("");
  if (!dateRaw || Number.isNaN(date.getTime())) {
    errors.push("date must be a valid ISO 8601 datetime");
  }

  const location = b.location != null ? String(b.location).trim() : "";
  if (!location) errors.push("location is required");
  else if (location.length > LOCATION_MAX)
    errors.push(`location must be at most ${LOCATION_MAX} characters`);

  const industry_field =
    b.industry_field != null ? String(b.industry_field).trim() : "";
  if (!industry_field) errors.push("industry_field is required");
  else if (industry_field.length > INDUSTRY_MAX)
    errors.push(`industry_field must be at most ${INDUSTRY_MAX} characters`);

  const attendanceRaw = b.expected_attendance;
  const attendance =
    attendanceRaw === undefined || attendanceRaw === ""
      ? NaN
      : Number(attendanceRaw);
  if (
    attendanceRaw === undefined ||
    attendanceRaw === "" ||
    Number.isNaN(attendance) ||
    attendance < 0 ||
    !Number.isFinite(attendance)
  ) {
    errors.push("expected_attendance must be a non-negative number");
  }

  let tags: string | undefined;
  if (b.tags != null && String(b.tags).trim() !== "") {
    tags = String(b.tags).trim();
    if (tags.length > TAGS_MAX)
      errors.push(`tags must be at most ${TAGS_MAX} characters`);
  }

  if (errors.length > 0) {
    res.status(status.BAD_REQUEST).json({
      status: status.BAD_REQUEST,
      message: errors,
    });
    return;
  }

  req.body = {
    title,
    description,
    date: dateRaw,
    location,
    industry_field,
    expected_attendance: Math.trunc(attendance),
    ...(tags !== undefined ? { tags } : {}),
  };

  next();
};
