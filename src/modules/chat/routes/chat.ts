import express from "express";
import { authMiddleware } from "@/modules/auth/middleware/auth";
import { getAblyToken } from "@/modules/chat/controllers/token";
import {
  getConversations,
  initializeConversationForEvent,
} from "@/modules/chat/controllers/conversations";
import { getMessages, sendMessage } from "@/modules/chat/controllers/messages";
import { initializeConversationValidators } from "@/modules/chat/validators/conversation";
import { messageValidators } from "@/modules/chat/validators/message";

const chatRouter = express.Router();

chatRouter.use(authMiddleware);

chatRouter.get("/token", getAblyToken);

chatRouter.get("/conversations", getConversations);
chatRouter.post(
  "/conversation",
  initializeConversationValidators,
  initializeConversationForEvent,
);

chatRouter.get("/conversation/:id/messages", getMessages);
chatRouter.post("/conversation/:id/message", messageValidators, sendMessage);

export default chatRouter;
