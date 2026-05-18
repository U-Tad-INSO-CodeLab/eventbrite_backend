import express from "express";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { requireSponsor, requireCreator } from "@/modules/auth/middleware/rbac";
import {
  createProposal,
  listProposalsByConversation,
  acceptProposalHandler,
  declineProposal,
  counterProposal,
} from "@/modules/proposals/controllers/proposals";
import {
  validateCreateProposal,
  validateListProposals,
  validateProposalAction,
  validateCounterProposal,
} from "@/modules/proposals/validators/proposals";

const proposalsRouter = express.Router();

proposalsRouter.use(authMiddleware);

proposalsRouter.post(
  "/",
  requireSponsor,
  validateCreateProposal,
  createProposal,
);

proposalsRouter.get(
  "/conversation/:id",
  validateListProposals,
  listProposalsByConversation,
);

proposalsRouter.patch(
  "/:id/accept",
  validateProposalAction,
  acceptProposalHandler,
);

proposalsRouter.patch(
  "/:id/decline",
  validateProposalAction,
  declineProposal,
);

proposalsRouter.post(
  "/:id/counter",
  requireCreator,
  validateCounterProposal,
  counterProposal,
);

export default proposalsRouter;
