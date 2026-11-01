import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'node:crypto';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  req.requestId = req.headers['x-request-id']?.toString() || randomBytes(8).toString('hex');
  res.setHeader('X-Request-Id', req.requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      const color = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
      console.log(`[${new Date().toISOString()}] [${req.requestId}] ${req.method} ${req.originalUrl} ${color}${res.statusCode}\x1b[0m - ${duration}ms`);
    }
  });

  next();
}
