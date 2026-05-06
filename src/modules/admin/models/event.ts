import { ModelConfig } from "@/modules/admin/types/model";

export const eventModel: ModelConfig = {
  label: "Events",
  prismaModel: "event",
  listFields: ["id", "title", "date", "location", "industry_field", "event_creator_id"],
  editFields: [
    { name: "title", type: "string" },
    { name: "description", type: "text" },
    { name: "cover_image", type: "string", optional: true },
    { name: "date", type: "datetime" },
    { name: "location", type: "string" },
    { name: "industry_field", type: "string" },
    { name: "expected_attendance", type: "number" },
    { name: "tags", type: "string", optional: true },
    { name: "event_creator_id", type: "relation", relation: { model: "user", labelField: "username" } },
  ],
};
