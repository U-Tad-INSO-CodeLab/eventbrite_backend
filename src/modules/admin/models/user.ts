import { ModelConfig } from "@/modules/admin/types/model";

export const userModel: ModelConfig = {
  label: "Users",
  prismaModel: "user",
  listFields: [
    "id",
    "username",
    "name",
    "surname",
    "email",
    "user_type",
    "enabled",
  ],
  editFields: [
    { name: "username", type: "string" },
    { name: "name", type: "string" },
    { name: "surname", type: "string" },
    { name: "email", type: "string" },
    { name: "password", type: "password" },
    { name: "user_type", type: "string" },
    { name: "enabled", type: "boolean" },
  ],
};
