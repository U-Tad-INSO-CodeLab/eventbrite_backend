import { prisma } from "@/core/prisma/client";
import { ProposalStatus } from "@/core/prisma/generated/client";
import { getContextUser } from "@/modules/auth/utils/context";
import { Request, Response } from "express";
import status from "http-status";

export const createProposal = async (req: Request, res: Response) => {
  const user = getContextUser()!;

  const conv = await prisma.conversation.findUnique({
    where: { id: req.body.conversationId },
  });

  if (!conv) {
    return res
      .status(status.NOT_FOUND)
      .json({ message: "Conversation not found" });
  }

  const proposal = await prisma.proposal.create({
    data: {
      tier_name: req.body.tierName,
      tier_price: req.body.tierPrice,
      tier_benefits: req.body.tierBenefits || "",
      is_event_tier: !!req.body.eventTierId,
      event_tier_id: req.body.eventTierId || null,
      sponsor_id: user.id,
      event_creator_id: conv.event_creator_id,
      status: ProposalStatus.NEGOTIATING,
    },
  });

  res.status(status.CREATED).json({ proposal });
};

export const listProposalsByConversation = async (
  req: Request,
  res: Response,
) => {
  const user = getContextUser()!;

  const conv = await prisma.conversation.findUnique({
    where: { id: parseInt(req.params.id, 10) },
  });

  if (!conv) {
    return res
      .status(status.NOT_FOUND)
      .json({ message: "Conversation not found" });
  }

  if (conv.event_creator_id !== user.id && conv.event_sponsor_id !== user.id) {
    return res
      .status(status.NOT_FOUND)
      .json({ message: "Conversation not found" });
  }

  const proposals = await prisma.proposal.findMany({
    where: {
      sponsor_id: conv.event_sponsor_id,
      event_creator_id: conv.event_creator_id,
    },
    include: {
      sponsor: {
        select: { id: true, username: true, name: true, surname: true },
      },
      event_creator: {
        select: { id: true, username: true, name: true, surname: true },
      },
    },
    orderBy: { id: "desc" },
  });

  res.json({ proposals });
};

export const acceptProposalHandler = async (req: Request, res: Response) => {
  const user = getContextUser()!;
  const proposalId = parseInt(req.params.id, 10);

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    return res.status(status.NOT_FOUND).json({ message: "Proposal not found" });
  }

  if (user.id !== proposal.event_creator_id) {
    return res
      .status(status.FORBIDDEN)
      .json({ message: "Only the event creator can perform this action" });
  }

  if (
    proposal.status !== ProposalStatus.NEGOTIATING &&
    proposal.status !== ProposalStatus.COUNTER_OFFERED
  ) {
    return res.status(status.BAD_REQUEST).json({
      message: `Cannot perform action on proposal with status ${proposal.status}`,
    });
  }

  await prisma.proposal.updateMany({
    where: {
      sponsor_id: proposal.sponsor_id,
      event_creator_id: proposal.event_creator_id,
      status: ProposalStatus.NEGOTIATING,
      id: { not: proposalId },
    },
    data: { status: ProposalStatus.DECLINED },
  });

  const accepted = await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: ProposalStatus.ACCEPTED },
  });

  res.json({ proposal: accepted });
};

export const declineProposal = async (req: Request, res: Response) => {
  const user = getContextUser()!;

  const proposal = await prisma.proposal.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!proposal) {
    return res.status(status.NOT_FOUND).json({ message: "Proposal not found" });
  }

  if (user.id !== proposal.event_creator_id) {
    return res
      .status(status.FORBIDDEN)
      .json({ message: "Only the event creator can perform this action" });
  }
  if (
    proposal.status !== ProposalStatus.NEGOTIATING &&
    proposal.status !== ProposalStatus.COUNTER_OFFERED
  ) {
    return res.status(status.BAD_REQUEST).json({
      message: `Cannot decline proposal with status ${proposal.status}`,
    });
  }

  const declined = await prisma.proposal.update({
    where: { id: parseInt(req.params.id) },
    data: { status: ProposalStatus.DECLINED },
  });
  res.json({ proposal: declined });
};

export const counterProposal = async (req: Request, res: Response) => {
  const user = getContextUser()!;

  const proposal = await prisma.proposal.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!proposal) {
    return res.status(status.NOT_FOUND).json({ message: "Proposal not found" });
  }

  if (user.id !== proposal.event_creator_id) {
    return res
      .status(status.FORBIDDEN)
      .json({ message: "Only the event creator can perform this action" });
  }

  if (proposal.status !== ProposalStatus.NEGOTIATING) {
    return res.status(status.BAD_REQUEST).json({
      message: `Cannot counter proposal with status ${proposal.status}`,
    });
  }

  await prisma.proposal.update({
    where: { id: parseInt(req.params.id) },
    data: { status: ProposalStatus.COUNTER_OFFERED },
  });

  const counter = await prisma.proposal.create({
    data: {
      tier_name: req.body.tierName || `Counter-offer: ${proposal.tier_name}`,
      tier_price: req.body.amountUsd,
      tier_benefits: proposal.tier_benefits,
      is_event_tier: false,
      event_tier_id: null,
      sponsor_id: proposal.event_creator_id,
      event_creator_id: proposal.sponsor_id,
      status: ProposalStatus.NEGOTIATING,
    },
  });

  res.status(status.CREATED).json({ proposal: counter });
};
