import { prisma } from "@/core/prisma/client";
import { requireContextUser } from "@/modules/auth/utils/context";
import { EVENT_TAG_OPTIONS } from "@/modules/events/constants/eventTags";
import { EVENT_UPLOAD_SUBDIR } from "@/modules/events/middleware/uploadEventCover";
import type { CreateEventTierInput } from "@/modules/events/validators/createEvent";
import {
  SPONSOR_EVENTS_PAGE_SIZE,
  type SponsorEventsQuery,
} from "@/modules/events/validators/queryEvents";
import { Request, Response } from "express";
import path from "path";
import status from "http-status";
import { buildSponsorEventWhere } from "../utils/buildSponsorEventWhere";

export const createEvent = async (req: Request, res: Response) => {
  const { id: event_creator_id } = requireContextUser();

  const {
    title,
    description,
    date,
    location,
    industry_field,
    expected_attendance,
    target_amount,
    tags,
    tiers,
  } = req.body as {
    title: string;
    description: string;
    date: string;
    location: string;
    industry_field: string;
    expected_attendance: number;
    target_amount: string;
    tags?: string;
    tiers?: CreateEventTierInput[];
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

  const tierRows = Array.isArray(tiers) ? tiers : [];

  const event = await prisma.$transaction(async (tx) => {
    const created = await tx.event.create({
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
        published: false,
        event_creator_id,
      },
    });
    if (tierRows.length > 0) {
      await tx.eventTier.createMany({
        data: tierRows.map((tier) => ({
          name: tier.name,
          price: tier.price,
          benefits: tier.benefits ?? "",
          tier_creator_id: event_creator_id,
          event_id: created.id,
        })),
      });
    }
    return tx.event.findUniqueOrThrow({
      where: { id: created.id },
      include: { event_tiers: true },
    });
  });

  res.status(status.CREATED).json({ event });
};

const updatePublishedForCreator = async (
  req: Request,
  res: Response,
  published: boolean,
) => {
  const contextUser = requireContextUser();

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
    include: { event_tiers: true },
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
    where: { event_creator_id: requireContextUser().id },
    orderBy: { date: "desc" },
    include: { event_tiers: true },
  });

  res.status(status.OK).json({ events });
};

export const queryEvents = async (req: Request, res: Response) => {
  const filters = req.query as unknown as SponsorEventsQuery;

  const where = buildSponsorEventWhere(filters);
  const skip = (filters.page - 1) * SPONSOR_EVENTS_PAGE_SIZE;

  const [total, events, locationGroups] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: SPONSOR_EVENTS_PAGE_SIZE,
      include: { event_tiers: true },
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
