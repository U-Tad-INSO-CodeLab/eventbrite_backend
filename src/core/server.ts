import express, { Application } from "express";
import cors from "cors";
import httpContext from "express-http-context";
import { errorHandler } from "@/core/middleware/errorHandler";
import authRouter from "@/modules/auth/routes/auth";
import { setupAdmin } from "@/modules/admin/routes/admin";

export function createServer(): Application {
  const app = express();

  app.use(cors());
  app.use(httpContext.middleware);

  setupAdmin(app);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1/auth", authRouter);

  app.use(errorHandler);

  return app;
}
