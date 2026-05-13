import { prisma } from "@/core/prisma/client";
import { Prisma } from "@/core/prisma/generated/client";
import { getContextUser } from "@/modules/auth/utils/context";
import { EVENT_TAG_OPTIONS } from "@/modules/events/constants/eventTags";
import { EVENT_UPLOAD_SUBDIR } from "@/modules/events/middleware/uploadEventCover";
import {
  SPONSOR_EVENTS_PAGE_SIZE,
  type SponsorEventsQuery,
} from "@/modules/events/validators/queryEvents";
import { Request, Response } from "express";
import path from "path";
import status from "http-status";

function buildSponsorEventWhere(
  filters: SponsorEventsQuery,
): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {
    published: true,
  };

  if (filters.target_amount_from != null || filters.target_amount_to != null) {
    where.target_amount = {};
    if (filters.target_amount_from != null) {
      where.target_amount.gte = filters.target_amount_from;
    }
    if (filters.target_amount_to != null) {
      where.target_amount.lte = filters.target_amount_to;
    }
  }

  if (filters.audience_from != null || filters.audience_to != null) {
    where.expected_attendance = {};
    if (filters.audience_from != null) {
      where.expected_attendance.gte = filters.audience_from;
    }
    if (filters.audience_to != null) {
      where.expected_attendance.lte = filters.audience_to;
    }
  }

  if (filters.location !== "all") {
    where.location = filters.location;
  }

  if (filters.industry !== "all") {
    where.industry_field = filters.industry;
  }

  if (filters.tags.length > 0) {
    where.AND = filters.tags.map((tag) => ({
      tags: { contains: tag },
    }));
  }

  return where;
}

export const createEvent = async (req: Request, res: Response) => {
  const event_creator_id = getContextUser()!.id;

  const {
    title,
    description,
    date,
    location,
    industry_field,
    expected_attendance,
    target_amount,
    tags,
  } = req.body as {
    title: string;
    description: string;
    date: string;
    location: string;
    industry_field: string;
    expected_attendance: number;
    target_amount: string;
    tags?: string;
  };

  const file = req.file;
  const cover_image = file
    ? path.posix.join(
        "/",
        EVENT_UPLOAD_SUBDIR.replace(/\\/g, "/"),
        file.filename,
      )
    : null;

  const tagsValue =
    typeof tags === "string" && tags.trim() !== "" ? tags.trim() : null;

  const event = await prisma.event.create({
    data: {
      title,
      description,
      cover_image,
      date: new Date(date),
      location,
      industry_field,
      expected_attendance,
      target_amount,
      tags: tagsValue,
      published: true,
      event_creator_id,
    },
  });

  res.status(status.CREATED).json({ event });
};

const updatePublishedForCreator = async (
  req: Request,
  res: Response,
  published: boolean,
) => {
  const contextUser = getContextUser();

  if (!contextUser) {
    res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
    return;
  }

  const id = Number(req.params.id);

  const existing = await prisma.event.findFirst({
    where: { id, event_creator_id: contextUser.id },
  });

  if (!existing) {
    res.status(status.NOT_FOUND).json({ message: "Event not found" });
    return;
  }

  const event = await prisma.event.update({
    where: { id },
    data: { published },
  });

  res.status(status.OK).json({ event });
};

export const publishEvent = async (req: Request, res: Response) => {
  await updatePublishedForCreator(req, res, true);
};

export const unpublishEvent = async (req: Request, res: Response) => {
  await updatePublishedForCreator(req, res, false);
};

export const getMyEvents = async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({
    where: { event_creator_id: getContextUser()!.id },
    orderBy: { date: "desc" },
  });

  res.status(status.OK).json({ events });
};

export const queryEvents = async (req: Request, res: Response) => {
  const filters = res.locals.sponsorEventsQuery;
  if (!filters) {
    res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Missing validated query" });
    return;
  }

  const where = buildSponsorEventWhere(filters);
  const skip = (filters.page - 1) * SPONSOR_EVENTS_PAGE_SIZE;

  const [total, events, locationGroups] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: SPONSOR_EVENTS_PAGE_SIZE,
    }),
    prisma.event.groupBy({
      by: ["location"],
      where: { published: true },
    }),
  ]);

  const totalPages = Math.ceil(total / SPONSOR_EVENTS_PAGE_SIZE);

  const locations = locationGroups
    .map((row) => row.location)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  res.status(status.OK).json({
    events,
    page: filters.page,
    pageSize: SPONSOR_EVENTS_PAGE_SIZE,
    total,
    totalPages,
    locations,
    availableTags: [...EVENT_TAG_OPTIONS],
  });
};
