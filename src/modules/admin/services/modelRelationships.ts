import { prisma } from "@/core/prisma/client";
import type { ModelConfig } from "@/modules/admin/types/model";

export async function getModelRelationshipOptions(
  config: ModelConfig,
): Promise<Record<string, { id: number; label: string }[]>> {
  const options: Record<string, { id: number; label: string }[]> = {};

  for (const field of config.editFields) {
    if (field.type === "relation" && field.relation) {
      const { model, labelField } = field.relation;

      const records = await (prisma as any)[model].findMany({
        select: { id: true, [labelField]: true },
        orderBy: { id: "asc" },
        take: 500,
      });

      options[field.name] = records.map((r: any) => ({
        id: r.id,
        label: labelField === "id" ? String(r.id) : String(r[labelField]),
      }));
    }
  }

  return options;
}

export async function getModelRelationshipLookups(
  config: ModelConfig,
): Promise<Record<string, Record<number, string>>> {
  const lookups: Record<string, Record<number, string>> = {};

  for (const field of config.editFields) {
    if (
      field.type === "relation" &&
      field.relation &&
      config.listFields.includes(field.name)
    ) {
      const { model, labelField } = field.relation;

      const records = await (prisma as any)[model].findMany({
        select: { id: true, [labelField]: true },
        orderBy: { id: "asc" },
        take: 500,
      });

      lookups[field.name] = Object.fromEntries(
        records.map((r: any) => [
          r.id,
          labelField === "id" ? String(r.id) : String(r[labelField]),
        ]),
      );
    }
  }

  return lookups;
}
