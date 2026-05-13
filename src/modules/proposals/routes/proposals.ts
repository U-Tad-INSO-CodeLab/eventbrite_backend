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

// POST /api/v1/proposals - crear propuesta (solo sponsor)
proposalsRouter.post(
  "/",
  requireSponsor,
  validateCreateProposal,
  createProposal,
);

// GET /api/v1/proposals/conversation/:conversationId - listar propuestas
proposalsRouter.get(
  "/conversation/:conversationId",
  validateListProposals,
  listProposalsByConversation,
);

// PATCH /api/v1/proposals/:id/accept - aceptar propuesta (solo creator)
proposalsRouter.patch(
  "/:id/accept",
  requireCreator,
  validateProposalAction,
  acceptProposalHandler,
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
