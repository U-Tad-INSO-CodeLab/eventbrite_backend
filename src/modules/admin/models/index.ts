import { userModel } from "@/modules/admin/models/user";
import { eventModel } from "@/modules/admin/models/event";
import { defaultTierModel } from "@/modules/admin/models/defaultTier";
import { eventTierModel } from "@/modules/admin/models/eventTier";
import { proposalModel } from "@/modules/admin/models/proposal";
import { conversationModel } from "@/modules/admin/models/conversation";
import { messageModel } from "@/modules/admin/models/message";
import { ModelConfig } from "@/modules/admin/types/index";

export const models: Record<string, ModelConfig> = {
  user: userModel,
  event: eventModel,
  defaultTier: defaultTierModel,
  eventTier: eventTierModel,
  proposal: proposalModel,
  conversation: conversationModel,
  message: messageModel,
};
