import express from "express";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { getAblyToken } from "@/modules/chat/controllers/token";
import {
  getConversations,
  getConversationById,
  initializeConversationForEvent,
} from "@/modules/chat/controllers/conversations";
import { getMessages, sendMessage } from "@/modules/chat/controllers/messages";
import { validateInitializeConversation } from "@/modules/chat/validators/conversation";
import { validateMessage } from "@/modules/chat/validators/message";

const chatRouter = express.Router();

chatRouter.use(authMiddleware);

chatRouter.get("/token", getAblyToken);

chatRouter.get("/conversations", getConversations);
chatRouter.get("/conversation/:id", getConversationById);
chatRouter.post(
  "/conversation",
  validateInitializeConversation,
  initializeConversationForEvent,
);

chatRouter.get("/conversation/:id/messages", getMessages);
chatRouter.post("/conversation/:id/message", validateMessage, sendMessage);

export default chatRouter;
