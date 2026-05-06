const db = {
  host: process.env.DATABASE_HOST ?? "localhost",
  port: process.env.DATABASE_PORT ?? "3306",
  user: process.env.DATABASE_USER ?? "",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "",
};

const auth = db.password === "" ? db.user : `${db.user}:${db.password}`;
const DATABASE_URL = `mysql://${auth}@${db.host}:${db.port}/${encodeURIComponent(db.database)}`;

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_HOST: db.host,
  DATABASE_PORT: db.port,
  DATABASE_USER: db.user,
  DATABASE_PASSWORD: db.password,
  DATABASE_NAME: db.database,
  DATABASE_URL: DATABASE_URL,
  JWT_SECRET: String(process.env.JWT_SECRET),
  JWT_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN ?? 7 * 24 * 60 * 60),
  ADMIN_COOKIE_SECRET: String(process.env.ADMIN_COOKIE_SECRET ?? "change-me"),
};
