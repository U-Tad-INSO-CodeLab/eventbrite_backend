import { prisma } from "@/core/prisma/client";
import { getContextUser } from "@/modules/auth/utils/context";
import { Request, Response } from "express";
import status from "http-status";
import { conversationQueryIncludeFields } from "@/modules/chat/utils/conversationInclude";

export const getConversations = async (req: Request, res: Response) => {
  const user = getContextUser()!;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ event_creator_id: user.id }, { event_sponsor_id: user.id }],
    },
    include: {
      event_creator: {
        select: { id: true, username: true, name: true, surname: true },
      },
      event_sponsor: {
        select: { id: true, username: true, name: true, surname: true },
      },
      messages: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });

  res.status(status.OK).json(conversations);
};

export const initializeConversationForEvent = async (
  req: Request,
  res: Response,
) => {
  const user = getContextUser()!;
  const { event_id } = req.body;

  if (user.user_type !== "sponsor") {
    res.status(status.BAD_REQUEST).json({
      message: "Only sponsors can open a conversation for an event",
    });
    return;
  }

  const event = await prisma.event.findUnique({
    where: { id: Number(event_id) },
  });

  if (!event) {
    res.status(status.NOT_FOUND).json({ message: "Event not found" });
    return;
  }

  const event_creator_id = event.event_creator_id;
  const event_sponsor_id = user.id;

  if (event_creator_id === event_sponsor_id) {
    res
      .status(status.BAD_REQUEST)
      .json({ message: "Cannot start a conversation with yourself" });
    return;
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      event_id: event.id,
      event_creator_id,
      event_sponsor_id,
    },
    include: conversationQueryIncludeFields,
  });

  if (conversation) {
    res
      .status(status.BAD_REQUEST)
      .json({ message: "Conversation already exists" });
    return;
  }

  conversation = await prisma.conversation.create({
    data: {
      event_id: event.id,
      event_creator_id,
      event_sponsor_id,
    },
    include: conversationQueryIncludeFields,
  });

  res.status(status.OK).json(conversation);
};
