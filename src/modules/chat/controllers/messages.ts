import { prisma } from "@/core/prisma/client";
import { ablyRest } from "@/modules/chat/services/ably";
import { getContextUser } from "@/modules/auth/utils/context";
import { Request, Response } from "express";
import status from "http-status";

export const getMessages = async (req: Request, res: Response) => {
  const user = getContextUser()!;
  const conversationId = Number(req.params.id);

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ event_creator_id: user.id }, { event_sponsor_id: user.id }],
    },
  });

  if (!conversation) {
    res.status(status.NOT_FOUND).json({ message: "Conversation not found" });
    return;
  }

  const messages = await prisma.message.findMany({
    where: { conversation_id: conversationId },
    include: {
      sender: { select: { id: true, username: true, name: true, surname: true } },
    },
    orderBy: { created_at: "asc" },
  });

  res.status(status.OK).json(messages);
};

export const sendMessage = async (req: Request, res: Response) => {
  const user = getContextUser()!;
  const conversationId = Number(req.params.id);
  const { message } = req.body;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ event_creator_id: user.id }, { event_sponsor_id: user.id }],
    },
  });

  if (!conversation) {
    res.status(status.NOT_FOUND).json({ message: "Conversation not found" });
    return;
  }

  const newMessage = await prisma.message.create({
    data: {
      message,
      conversation_id: conversationId,
      sender_id: user.id,
    },
    include: {
      sender: { select: { id: true, username: true, name: true, surname: true } },
    },
  });

  await ablyRest.channels.get(`conversation:${conversationId}`).publish("message", newMessage);

  res.status(status.CREATED).json(newMessage);
};
