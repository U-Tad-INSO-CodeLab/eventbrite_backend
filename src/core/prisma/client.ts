import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "@/core/config/env.js";
import { PrismaClient } from "@/core/prisma/generated/client.js";

const adapter = new PrismaMariaDb({
  host: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT),
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };