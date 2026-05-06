import express, { Application } from "express";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { fileURLToPath } from "url";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import { env } from "@/core/config/env";
import { authRouter } from "./auth";
import { crudRouter } from "./crud";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viewsDir = path.join(__dirname, "../views");

export function setupAdmin(app: Application): void {
  app.set("view engine", "ejs");
  app.set("views", viewsDir);
  app.use(expressLayouts);
  app.set("layout", "layouts/main");
  app.use("/admin", router);
}

const router = express.Router();

/* ─── Body parsing (scoped to admin) ─── */
router.use(express.urlencoded({ extended: true }));

/* ─── Session store ─── */
const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore({
  host: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT),
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  createDatabaseTable: true,
});

sessionStore.on("error", (err) => console.error("[AdminSessionStore]", err));

router.use(
  session({
    secret: env.ADMIN_COOKIE_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    },
  }),
);

/* ─── Default locals for layout ─── */
router.use((_req, res, next) => {
  res.locals.modelKey = res.locals.modelKey ?? "";
  next();
});

/* ─── Sub-routers ─── */
router.use("/", authRouter);
router.use("/", crudRouter);

export { router as adminRouter };
