import { Router } from "express";
import { prisma } from "@/core/prisma/client";
import { models } from "@/modules/admin/models/registry";
import { view } from "@/modules/admin/views/resolve";
import { requireAuth } from "@/modules/admin/middleware/auth";
import { coerceBody } from "@/modules/admin/utils/coerce";
import { ModelConfig } from "@/modules/admin/types/model";

const crudRouter = Router();

async function getRelationOptions(
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

async function getRelationLookups(
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
        records.map((r: any) => [r.id, labelField === "id" ? String(r.id) : String(r[labelField])]),
      );
    }
  }
  return lookups;
}

crudRouter.get("/", requireAuth, (req, res) => {
  res.render(view("dashboard"), { models, modelKey: "" });
});

crudRouter.get("/:model", requireAuth, async (req, res) => {
  const { model } = req.params;
  const config = models[model];
  if (!config)
    return res.status(404).render(view("dashboard"), { models, modelKey: "" });

  const [rows, relationLookups] = await Promise.all([
    (prisma as any)[config.prismaModel].findMany({ orderBy: { id: "desc" }, take: 200 }),
    getRelationLookups(config),
  ]);

  res.render(view("list"), { config, rows, modelKey: model, models, relationLookups });
});

crudRouter.get("/:model/new", requireAuth, async (req, res) => {
  const { model } = req.params;
  const config = models[model];
  if (!config)
    return res.status(404).render(view("dashboard"), { models, modelKey: "" });

  const relationOptions = await getRelationOptions(config);
  res.render(view("form"), { config, row: null, modelKey: model, models, relationOptions });
});

crudRouter.post("/:model", requireAuth, async (req, res) => {
  const { model } = req.params;
  const config = models[model];
  if (!config)
    return res.status(404).render(view("dashboard"), { models, modelKey: "" });

  const data = await coerceBody(config.editFields, req.body);
  await (prisma as any)[config.prismaModel].create({ data });
  res.redirect(`/admin/${model}`);
});

crudRouter.get("/:model/:id/edit", requireAuth, async (req, res) => {
  const { model, id } = req.params;
  const config = models[model];
  if (!config)
    return res.status(404).render(view("dashboard"), { models, modelKey: "" });

  const [row, relationOptions] = await Promise.all([
    (prisma as any)[config.prismaModel].findUnique({ where: { id: Number(id) } }),
    getRelationOptions(config),
  ]);

  if (!row)
    return res
      .status(404)
      .render(view("list"), { config, rows: [], modelKey: model, models });

  res.render(view("form"), { config, row, modelKey: model, models, relationOptions });
});

crudRouter.post("/:model/:id", requireAuth, async (req, res) => {
  const { model, id } = req.params;
  const config = models[model];
  if (!config)
    return res.status(404).render(view("dashboard"), { models, modelKey: "" });

  const data = await coerceBody(config.editFields, req.body, true);
  await (prisma as any)[config.prismaModel].update({
    where: { id: Number(id) },
    data,
  });
  res.redirect(`/admin/${model}`);
});

crudRouter.post("/:model/:id/delete", requireAuth, async (req, res) => {
  const { model, id } = req.params;
  const config = models[model];
  if (!config)
    return res.status(404).render(view("dashboard"), { models, modelKey: "" });

  await (prisma as any)[config.prismaModel].delete({
    where: { id: Number(id) },
  });
  res.redirect(`/admin/${model}`);
});

export { crudRouter };
