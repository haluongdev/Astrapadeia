import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database.js';
import { env } from '../config/env.js';
import { HealthCheckResponse } from '../types/index.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const dbHealth = await checkDatabaseHealth();
  const isHealthy = dbHealth.connected;

  const payload: HealthCheckResponse = {
    status: isHealthy ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
    database: dbHealth,
  };

  res.status(isHealthy ? 200 : 503).json(payload);
}
