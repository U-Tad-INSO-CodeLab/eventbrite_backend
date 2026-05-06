import { ModelConfig } from "@/modules/admin/types/model";

export const conversationModel: ModelConfig = {
  label: "Conversations",
  prismaModel: "conversation",
  listFields: ["id", "event_creator_id", "event_sponsor_id"],
  editFields: [
    { name: "event_creator_id", type: "number" },
    { name: "event_sponsor_id", type: "number" },
  ],
};
