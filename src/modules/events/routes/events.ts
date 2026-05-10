import express from "express";
import {
  createEvent,
  getMyEvents,
  queryEvents,
} from "@/modules/events/controllers/events";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { uploadEventCover } from "@/modules/events/middleware/uploadEventCover";
import { validateCreateEventMultipart } from "@/modules/events/validators/createEvent";
import { validateQueryEvents } from "@/modules/events/validators/queryEvents";

const eventsRouter = express.Router();

eventsRouter.get("/mine", authMiddleware, getMyEvents);
eventsRouter.get("/query", authMiddleware, validateQueryEvents, queryEvents);

eventsRouter.post(
  "/",
  authMiddleware,
  uploadEventCover,
  validateCreateEventMultipart,
  createEvent,
);

export default eventsRouter;
