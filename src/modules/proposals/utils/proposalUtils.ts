import { prisma } from "@/core/prisma/client";
import { ProposalStatus } from "@/core/prisma/generated/client";
import status from "http-status";

export class ProposalError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export async function getProposal(id: number) {
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) throw new ProposalError(status.NOT_FOUND, "Proposal not found");
  return proposal;
}

export async function getConversation(id: number) {
  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: { event: true },
  });
  if (!conv) throw new ProposalError(status.NOT_FOUND, "Conversation not found");
  return conv;
}

export function assertSponsor(userId: number, conversationSponsorId: number) {
  if (userId !== conversationSponsorId) {
    throw new ProposalError(status.FORBIDDEN, "Sponsor is not part of this conversation");
  }
}

export function assertCreator(userId: number, creatorId: number) {
  if (userId !== creatorId) {
    throw new ProposalError(status.FORBIDDEN, "Only the event creator can perform this action");
  }
}

export function assertProposalStatus(proposal: any, ...validStatuses: ProposalStatus[]) {
  if (!validStatuses.includes(proposal.status)) {
    throw new ProposalError(
      status.BAD_REQUEST,
      `Cannot perform action on proposal with status ${proposal.status}`
    );
  }
}