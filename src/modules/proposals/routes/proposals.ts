import express from "express";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { requireSponsor, requireCreator } from "@/modules/auth/middleware/rbac";
import {
  createProposal,
  proposalConversationHistory, 
  acceptProposal,              
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

// POST /api/v1/proposals - crear propuesta (solo sponsor)
proposalsRouter.post(
  "/",
  requireSponsor,
  validateCreateProposal,
  createProposal,
);

// GET /api/v1/proposals/conversation/:conversation-id - 🔄 Kebab-case aplicado aquí
proposalsRouter.get(
  "/conversation/:conversation-id",
  validateListProposals,
  proposalConversationHistory,
);

// PATCH /api/v1/proposals/:id/accept - aceptar propuesta (solo creator)
proposalsRouter.patch(
  "/:id/accept",
  requireCreator,
  validateProposalAction,
  acceptProposal,
);

// PATCH /api/v1/proposals/:id/decline - rechazar propuesta (solo creator)
proposalsRouter.patch(
  "/:id/decline",
  requireCreator,
  validateProposalAction,
  declineProposal,
);

// POST /api/v1/proposals/:id/counter - hacer contraoferta (solo creator)
proposalsRouter.post(
  "/:id/counter",
  requireCreator,
  validateCounterProposal,
  counterProposal,
);

export default proposalsRouter;