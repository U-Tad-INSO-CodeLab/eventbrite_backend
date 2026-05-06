import { ModelConfig } from "@/modules/admin/types/model";

export const proposalModel: ModelConfig = {
  label: "Proposals",
  prismaModel: "proposal",
  listFields: [
    "id",
    "tier_name",
    "tier_price",
    "status",
    "sponsor_id",
    "event_creator_id",
  ],
  editFields: [
    { name: "tier_name", type: "string" },
    { name: "tier_price", type: "number" },
    { name: "tier_benefits", type: "text" },
    { name: "is_event_tier", type: "boolean" },
    { name: "status", type: "string" },
    { name: "event_tier_id", type: "number", optional: true },
    { name: "sponsor_id", type: "number" },
    { name: "event_creator_id", type: "number" },
  ],
};
