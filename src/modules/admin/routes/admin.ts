import express from "express";
import { authRouter } from "./auth";
import { crudRouter } from "./crud";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.use((_req, res, next) => {
  res.locals.modelKey = res.locals.modelKey ?? "";
  next();
});

router.use("/", authRouter);
router.use("/", crudRouter);

export { router as adminRouter };
