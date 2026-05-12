import express from "express";
import {
  createEvent,
  getMyEvents,
  queryEvents,
} from "@/modules/events/controllers/events";
import {
  createDefaultTier,
  deleteDefaultTier,
  listDefaultTiers,
  updateDefaultTier,
} from "@/modules/events/controllers/defaultTiers";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { requireCreator, requireSponsor } from "@/modules/auth/middleware/rbac";
import { uploadEventCover } from "@/modules/events/middleware/uploadEventCover";
import { validateAndSanitizeCreateEvent } from "@/modules/events/validators/createEvent";
import {
  validateDefaultTierBody,
  validateDefaultTierIdParam,
} from "@/modules/events/validators/defaultTier";
import { validateQueryEvents } from "@/modules/events/validators/queryEvents";

const eventsRouter = express.Router();

eventsRouter.get("/mine", authMiddleware, requireCreator, getMyEvents);
eventsRouter.get(
  "/query",
  authMiddleware,
  requireSponsor,
  validateQueryEvents,
  queryEvents,
);

eventsRouter.post(
  "/",
  authMiddleware,
  requireCreator,
  uploadEventCover,
  validateAndSanitizeCreateEvent,
  createEvent,
);

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

export default eventsRouter;
