import 'dotenv/config';
import { env } from '@/core/config/env.js';
import { PrismaClient } from '@/core/prisma/generated/client.js';

const prisma = new PrismaClient();

export { prisma };
