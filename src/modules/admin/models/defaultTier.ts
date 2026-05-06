import { ModelConfig } from "@/modules/admin/types/model";

export const defaultTierModel: ModelConfig = {
  label: "Default Tiers",
  prismaModel: "defaultTier",
  listFields: ["id", "name", "price", "event_creator_id"],
  editFields: [
    { name: "name", type: "string" },
    { name: "price", type: "number" },
    { name: "benefits", type: "text" },
    { name: "event_creator_id", type: "number" },
  ],
};
