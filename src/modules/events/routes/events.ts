import express from "express";
import { createEvent } from "@/modules/events/controllers/events";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { uploadEventCover } from "@/modules/events/middleware/uploadEventCover";
import { validateAndSanitizeCreateEvent } from "@/modules/events/validators/createEvent";

const eventsRouter = express.Router();

eventsRouter.post(
  "/",
  authMiddleware,
  uploadEventCover,
  validateAndSanitizeCreateEvent,
  createEvent,
);

export default eventsRouter;
