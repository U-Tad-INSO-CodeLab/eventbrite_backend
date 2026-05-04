import express, { Application } from 'express';
import httpContext from 'express-http-context';
import { errorHandler } from '@/core/middleware/errorHandler.js';

export function createServer(): Application {
  const app = express();

  app.use(httpContext.middleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // modules register their routes here

  app.use(errorHandler);

  return app;
}
