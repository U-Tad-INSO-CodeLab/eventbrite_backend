import { prisma } from "@/core/prisma/client";
import { ProposalStatus } from "@/core/prisma/generated/client";
import { getContextUser } from "@/modules/auth/utils/context";
import { Request, Response } from "express";
import status from "http-status";
import {
  ProposalError,
  getProposal,
  getConversation,
  validateEventTier,
  assertCreator,
} from "@/modules/proposals/utils/proposalUtils";
import {
  validateProposalCreation,
  acceptProposal,
} from "@/modules/proposals/services/proposals";

// Controller for creating a new proposal
export const createProposal = async (req: Request, res: Response) => {
  try {
    const user = getContextUser();
    if (!user)
      return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });

    const conv = await validateProposalCreation(
      req.body.conversationId,
      user.id,
      req.body.eventTierId,
    );
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
  } catch (e) {
    if (e instanceof ProposalError)
      return res.status(e.statusCode).json({ message: e.message });
    throw e;
  }
};

export const listProposalsByConversation = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = getContextUser();
    if (!user)
      return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });

    const conv = await getConversation(parseInt(req.params.conversationId));
    if (
      conv.event_creator_id !== user.id &&
      conv.event_sponsor_id !== user.id
    ) {
      return res
        .status(status.FORBIDDEN)
        .json({ message: "Not a conversation participant" });
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
  } catch (e) {
    if (e instanceof ProposalError)
      return res.status(e.statusCode).json({ message: e.message });
    throw e;
  }
};

export const acceptProposalHandler = async (req: Request, res: Response) => {
  try {
    const user = getContextUser();
    if (!user)
      return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
    const accepted = await acceptProposal(parseInt(req.params.id), user.id);
    res.json({ proposal: accepted });
  } catch (e) {
    if (e instanceof ProposalError)
      return res.status(e.statusCode).json({ message: e.message });
    throw e;
  }
};

export const declineProposal = async (req: Request, res: Response) => {
  try {
    const user = getContextUser();
    if (!user)
      return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });

    const proposal = await getProposal(parseInt(req.params.id));
    assertCreator(user.id, proposal.event_creator_id);
    if (
      ![ProposalStatus.NEGOTIATING, ProposalStatus.COUNTER_OFFERED].includes(
        proposal.status,
      )
    ) {
      return res
        .status(status.BAD_REQUEST)
        .json({
          message: `Cannot decline proposal with status ${proposal.status}`,
        });
    }

    const declined = await prisma.proposal.update({
      where: { id: parseInt(req.params.id) },
      data: { status: ProposalStatus.DECLINED },
    });
    res.json({ proposal: declined });
  } catch (e) {
    if (e instanceof ProposalError)
      return res.status(e.statusCode).json({ message: e.message });
    throw e;
  }
};

export const counterProposal = async (req: Request, res: Response) => {
  try {
    const user = getContextUser();
    if (!user)
      return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });

    const proposal = await getProposal(parseInt(req.params.id));
    assertCreator(user.id, proposal.event_creator_id);
    if (proposal.status !== ProposalStatus.NEGOTIATING) {
      return res
        .status(status.BAD_REQUEST)
        .json({
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
  } catch (e) {
    if (e instanceof ProposalError)
      return res.status(e.statusCode).json({ message: e.message });
    throw e;
  }
};
