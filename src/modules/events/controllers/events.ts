import { prisma } from "@/core/prisma/client";
import { getContextUser } from "@/modules/auth/utils/context";
import { EVENT_UPLOAD_SUBDIR } from "@/modules/events/middleware/uploadEventCover";
import { Request, Response } from "express";
import path from "path";
import status from "http-status";

export const createEvent = async (req: Request, res: Response) => {
  const contextUser = getContextUser();

  if (!contextUser) {
    res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
    return;
  }

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
      tags: typeof tags === "string" && tags.trim() !== "" ? tags.trim() : null,
      published: true,
      event_creator_id: contextUser.id,
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
