import { prisma } from "@/core/prisma/client";
import { ProposalStatus } from "@/core/prisma/generated/client";
import {
  ProposalError,
  getProposal,
  getConversation,
  assertSponsor,
  assertCreator,
  assertProposalStatus,
} from "@/modules/proposals/utils/proposalUtils"; // 🔄 Quitamos 'validateEventTier' de las utilidades

export { ProposalError };

export async function acceptProposal(proposalId: number, creatorId: number) {
  const proposal = await getProposal(proposalId);
  assertCreator(creatorId, proposal.event_creator_id);
  assertProposalStatus(proposal, ProposalStatus.NEGOTIATING, ProposalStatus.COUNTER_OFFERED);

  await prisma.proposal.updateMany({
    where: {
      sponsor_id: proposal.sponsor_id,
      event_creator_id: proposal.event_creator_id,
      status: ProposalStatus.NEGOTIATING,
      id: { not: proposalId },
    },
    data: { status: ProposalStatus.DECLINED },
  });

  return prisma.proposal.update({
    where: { id: proposalId },
    data: { status: ProposalStatus.ACCEPTED },
  });
}

export async function verifySponsorInConversation(conversationId: number, sponsorId: number) {
  const conversation = await getConversation(conversationId);
  assertSponsor(sponsorId, conversation.event_sponsor_id);
  return conversation;
}