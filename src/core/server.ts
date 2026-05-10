import express, { Application } from "express";
import cors from "cors";
import httpContext from "express-http-context";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "@/core/middleware/errorHandler";
import { sessionStoreMiddleware } from "@/core/config/sessionStore";
import authRouter from "@/modules/auth/routes/auth";
import eventsRouter from "@/modules/events/routes/events";
import { adminRouter } from "@/modules/admin/routes/admin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createServer(): Application {
  const app = express();

  app.use(cors());
  app.use(httpContext.middleware);
  app.use(sessionStoreMiddleware());

  // Admin module
  const adminViewsDir = path.join(__dirname, "../modules/admin/views");
  app.set("view engine", "ejs");
  app.set("views", adminViewsDir);
  app.use(expressLayouts);
  app.set("layout", "layouts/main");
  app.use("/admin", adminRouter);

  // API routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const publicUploadsDir = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(publicUploadsDir));

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/events", eventsRouter);

  app.use(errorHandler);

  return app;
}
