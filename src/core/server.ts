import express, { Application } from "express";
import cors from "cors";
import httpContext from "express-http-context";
import { errorHandler } from "@/core/middleware/errorHandler.js";
import authRouter from "@/modules/auth/routes/auth";

export function createServer(): Application {
  const app = express();

  app.use(cors());
  app.use(httpContext.middleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // App routes
  app.use("/api/v1/auth", authRouter);

  app.use(errorHandler);

  return app;
}
