import { Router } from "express";
import { prisma } from "@/core/prisma/client";
import { models } from "@/modules/admin/models/registry";
import { view } from "@/modules/admin/views/resolve";
import { requireAuth } from "@/modules/admin/middleware/auth";
import { coerceBody } from "@/modules/admin/utils/coerce";

const crudRouter = Router();

crudRouter.get("/", requireAuth, (req, res) => {
  res.render(view("dashboard"), { models, modelKey: "" });
});

crudRouter.get("/:model", requireAuth, async (req, res) => {
  const { model } = req.params;
  const config = models[model];
  if (!config)
    return res.status(404).render(view("dashboard"), { models, modelKey: "" });

  const rows = await (prisma as any)[config.prismaModel].findMany({
    orderBy: { id: "desc" },
    take: 200,
  });

  res.render(view("list"), { config, rows, modelKey: model, models });
});

crudRouter.get("/:model/new", requireAuth, (req, res) => {
  const { model } = req.params;
  const config = models[model];
  if (!config)
    return res.status(404).render(view("dashboard"), { models, modelKey: "" });

  res.render(view("form"), { config, row: null, modelKey: model, models });
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

  const row = await (prisma as any)[config.prismaModel].findUnique({
    where: { id: Number(id) },
  });

  if (!row)
    return res
      .status(404)
      .render(view("list"), { config, rows: [], modelKey: model, models });

  res.render(view("form"), { config, row, modelKey: model, models });
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
