import { Request, Response } from "express";
import { prisma } from "@/core/prisma/client";
import { models } from "@/modules/admin/models/registry";
import { view } from "@/modules/admin/views/resolve";
import { coerceBody } from "@/modules/admin/utils/coerce";
import {
  getModelRelationshipLookups,
  getModelRelationshipOptions,
} from "@/modules/admin/services/modelRelationships";

export function dashboard(_req: Request, res: Response): void {
  res.render(view("dashboard"), { models, modelKey: "" });
}

export async function listModel(req: Request, res: Response): Promise<void> {
  const { model } = req.params;
  const config = models[model];
  if (!config) {
    res.status(404).render(view("dashboard"), { models, modelKey: "" });
    return;
  }

  const [rows, relationLookups] = await Promise.all([
    (prisma as any)[config.prismaModel].findMany({
      orderBy: { id: "desc" },
      take: 200,
    }),
    getModelRelationshipLookups(config),
  ]);

  res.render(view("list"), {
    config,
    rows,
    modelKey: model,
    models,
    relationLookups,
  });
}

export async function newRecordForm(
  req: Request,
  res: Response,
): Promise<void> {
  const { model } = req.params;
  const config = models[model];
  if (!config) {
    res.status(404).render(view("dashboard"), { models, modelKey: "" });
    return;
  }

  const relationOptions = await getModelRelationshipOptions(config);
  res.render(view("form"), {
    config,
    row: null,
    modelKey: model,
    models,
    relationOptions,
  });
}

export async function createRecord(req: Request, res: Response): Promise<void> {
  const { model } = req.params;
  const config = models[model];
  if (!config) {
    res.status(404).render(view("dashboard"), { models, modelKey: "" });
    return;
  }

  const data = await coerceBody(config.editFields, req.body);
  await (prisma as any)[config.prismaModel].create({ data });
  res.redirect(`/admin/${model}`);
}

export async function editRecordForm(
  req: Request,
  res: Response,
): Promise<void> {
  const { model, id } = req.params;
  const config = models[model];
  if (!config) {
    res.status(404).render(view("dashboard"), { models, modelKey: "" });
    return;
  }

  const [row, relationOptions] = await Promise.all([
    (prisma as any)[config.prismaModel].findUnique({
      where: { id: Number(id) },
    }),
    getModelRelationshipOptions(config),
  ]);

  if (!row) {
    res
      .status(404)
      .render(view("list"), { config, rows: [], modelKey: model, models });
    return;
  }

  res.render(view("form"), {
    config,
    row,
    modelKey: model,
    models,
    relationOptions,
  });
}

export async function updateRecord(req: Request, res: Response): Promise<void> {
  const { model, id } = req.params;
  const config = models[model];
  if (!config) {
    res.status(404).render(view("dashboard"), { models, modelKey: "" });
    return;
  }

  const data = await coerceBody(config.editFields, req.body, true);
  await (prisma as any)[config.prismaModel].update({
    where: { id: Number(id) },
    data,
  });
  res.redirect(`/admin/${model}`);
}

export async function deleteRecord(req: Request, res: Response): Promise<void> {
  const { model, id } = req.params;
  const config = models[model];
  if (!config) {
    res.status(404).render(view("dashboard"), { models, modelKey: "" });
    return;
  }

  await (prisma as any)[config.prismaModel].delete({
    where: { id: Number(id) },
  });
  res.redirect(`/admin/${model}`);
}
