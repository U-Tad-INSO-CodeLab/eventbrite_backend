import { Router } from "express";
import { requireAuth } from "@/modules/admin/middleware/auth";
import {
  dashboard,
  listModel,
  newRecordForm,
  createRecord,
  editRecordForm,
  updateRecord,
  deleteRecord,
} from "@/modules/admin/controllers/crud";

const crudRouter = Router();

crudRouter.get("/", requireAuth, dashboard);
crudRouter.get("/:model", requireAuth, listModel);
crudRouter.get("/:model/new", requireAuth, newRecordForm);
crudRouter.post("/:model", requireAuth, createRecord);
crudRouter.get("/:model/:id/edit", requireAuth, editRecordForm);
crudRouter.post("/:model/:id", requireAuth, updateRecord);
crudRouter.post("/:model/:id/delete", requireAuth, deleteRecord);

export { crudRouter };
