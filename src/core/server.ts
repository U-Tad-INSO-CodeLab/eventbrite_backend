import express, { Application } from 'express';
import { errorHandler } from '@/core/middleware/errorHandler.js';

export function createServer(): Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // modules register their routes here

  app.use(errorHandler);

  return app;
}
