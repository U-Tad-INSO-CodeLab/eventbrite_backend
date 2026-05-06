import { ModelConfig } from "@/modules/admin/types/model";

export const messageModel: ModelConfig = {
  label: "Messages",
  prismaModel: "message",
  listFields: ["id", "message", "created_at", "conversation_id", "sender_id"],
  editFields: [
    { name: "message", type: "text" },
    { name: "last_read", type: "datetime", optional: true },
    { name: "conversation_id", type: "relation", relation: { model: "conversation", labelField: "id" } },
    { name: "sender_id", type: "relation", relation: { model: "user", labelField: "username" } },
  ],
};
