import bcrypt from "bcrypt";
import { FieldConfig } from "@/modules/admin/types/field";

export async function coerceBody(
  fields: FieldConfig[],
  body: Record<string, string>,
  isUpdate = false,
): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = body[field.name];

    if (field.type === "password") {
      if (raw) data[field.name] = await bcrypt.hash(raw, 10);
      // on update, skip blank password — keeps existing hash
      continue;
    }

    if (isUpdate && (raw === undefined || raw === "")) {
      if (field.optional) data[field.name] = null;
      continue;
    }

    switch (field.type) {
          case "number":
          case "relation":
              data[field.name] = raw ? Number(raw) : field.optional ? null : 0;
              break;
      case "boolean":
        data[field.name] = raw === "true" || raw === "on" || raw === "1";
        break;
      case "datetime":
        data[field.name] = raw
          ? new Date(raw)
          : field.optional
            ? null
            : new Date();
        break;
      default:
        data[field.name] = raw ?? "";
    }
  }

  return data;
}
