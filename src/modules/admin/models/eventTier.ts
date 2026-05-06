import { ModelConfig } from "@/modules/admin/types/model";

export const eventTierModel: ModelConfig = {
  label: "Event Tiers",
  prismaModel: "eventTier",
  listFields: ["id", "name", "price", "event_id", "tier_creator_id"],
  editFields: [
    { name: "name", type: "string" },
    { name: "price", type: "number" },
    { name: "benefits", type: "text" },
    { name: "event_id", type: "number" },
    { name: "tier_creator_id", type: "number" },
  ],
};
