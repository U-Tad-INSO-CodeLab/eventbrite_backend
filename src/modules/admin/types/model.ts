import { FieldConfig } from "@/modules/admin/types/field";

export type ModelConfig = {
  label: string;
  prismaModel: string;
  listFields: string[];
  editFields: FieldConfig[];
};
