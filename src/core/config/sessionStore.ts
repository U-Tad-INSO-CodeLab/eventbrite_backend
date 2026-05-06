import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import type { RequestHandler } from "express";
import { env } from "@/core/config/env";

export function sessionStoreMiddleware(): RequestHandler {
  const MySQLStore = MySQLStoreFactory(session);

  const sessionStore = new MySQLStore({
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT),
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    createDatabaseTable: true,
  });

  sessionStore.on("error", (err) => console.error("[MysqlSessionStore]", err));

  return session({
    secret: env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    },
  });
}
