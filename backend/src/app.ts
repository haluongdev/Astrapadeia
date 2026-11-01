import express, { Express } from 'express';
import { setupSecurityMiddlewares } from './middlewares/security.middleware.js';
import { requestLogger } from './middlewares/logging.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // 1. Security headers, CORS, body parsers, cookie parser
  setupSecurityMiddlewares(app);

  // 2. Request logger & ID tracking
  app.use(requestLogger);

  // 3. API Routers
  app.use('/api', apiRouter);

  // 4. 404 handler for unmatched routes
  app.use(notFoundHandler);

  // 5. Centralized error handling middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
