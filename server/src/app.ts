import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { checkDatabaseHealth } from './db/pool.js';
import { eventsRouter } from './modules/events/events.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(): Express {
  const app = express();

  // 1. Security & Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    })
  );
  app.use(express.json({ limit: '2mb' }));

  // 2. Comprehensive Health Check
  app.get('/health', async (_req, res) => {
    const dbHealth = await checkDatabaseHealth();
    const isReady = dbHealth.isHealthy;

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      services: {
        database: {
          connected: dbHealth.isHealthy,
          latencyMs: dbHealth.latencyMs,
          error: dbHealth.error,
        },
      },
    });
  });

  // 3. API Modules
  app.use('/api/v1/events', eventsRouter);

  // 4. Fallback 404 Handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API route does not exist.',
    });
  });

  // 5. Global Error Handler
  app.use(errorHandler);

  return app;
}
