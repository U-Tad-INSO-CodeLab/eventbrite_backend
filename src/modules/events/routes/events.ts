import express from "express";
import {
  createEvent,
  publishEvent,
  unpublishEvent,
} from "@/modules/events/controllers/events";
import {
  createDefaultTier,
  deleteDefaultTier,
  listDefaultTiers,
  updateDefaultTier,
} from "@/modules/events/controllers/defaultTiers";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { requireCreator } from "@/modules/auth/middleware/rbac";
import { uploadEventCover } from "@/modules/events/middleware/uploadEventCover";
import { validateAndSanitizeCreateEvent } from "@/modules/events/validators/createEvent";
import {
  validateDefaultTierBody,
  validateDefaultTierIdParam,
} from "@/modules/events/validators/defaultTier";
import { validateEventIdParam } from "@/modules/events/validators/eventId";

const eventsRouter = express.Router();

// Events routes
eventsRouter.post(
  "/",
  authMiddleware,
  requireCreator,
  uploadEventCover,
  validateAndSanitizeCreateEvent,
  createEvent,
);

// Default tiers routes
eventsRouter.get(
  "/default-tiers",
  authMiddleware,
  requireCreator,
  listDefaultTiers,
);
eventsRouter.post(
  "/default-tiers",
  authMiddleware,
  requireCreator,
  validateDefaultTierBody,
  createDefaultTier,
);
eventsRouter.put(
  "/default-tiers/:id",
  authMiddleware,
  requireCreator,
  validateDefaultTierIdParam,
  validateDefaultTierBody,
  updateDefaultTier,
);
eventsRouter.delete(
  "/default-tiers/:id",
  authMiddleware,
  requireCreator,
  validateDefaultTierIdParam,
  deleteDefaultTier,
);

eventsRouter.post(
  "/:id/publish",
  authMiddleware,
  requireCreator,
  validateEventIdParam,
  publishEvent,
);
eventsRouter.post(
  "/:id/unpublish",
  authMiddleware,
  requireCreator,
  validateEventIdParam,
  unpublishEvent,
);

export default eventsRouter;
