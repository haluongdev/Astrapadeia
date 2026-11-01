
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, {
  Express,
  Request,
  Response,
  NextFunction,
} from 'express';
import { env } from '../config/env.js';

const SAFE_METHODS = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
]);

function normalizeOrigin(value: string): string {
  return new URL(value).origin;
}

function csrfOriginProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const allowedOrigin = normalizeOrigin(env.FRONTEND_ORIGIN);
  const origin = req.get('Origin');
  const fetchSite = req.get('Sec-Fetch-Site');

  // Reject conflicting Fetch Metadata before examining Origin.
  if (fetchSite === 'cross-site') {
    res.status(403).json({
      error: 'Cross-site request forbidden',
      code: 'CSRF_CROSS_SITE_FORBIDDEN',
    });
    return;
  }

  // Browsers normally include Origin on cross-origin
  // state-changing requests.
  if (origin) {
    let normalizedRequestOrigin: string;

    try {
      normalizedRequestOrigin = normalizeOrigin(origin);
    } catch {
      res.status(403).json({
        error: 'Nguồn yêu cầu không hợp lệ',
        code: 'CSRF_ORIGIN_INVALID',
      });
      return;
    }

    if (normalizedRequestOrigin !== allowedOrigin) {
      res.status(403).json({
        error: 'Yêu cầu bị từ chối do nguồn không được phép',
        code: 'CSRF_ORIGIN_FORBIDDEN',
      });
      return;
    }

    next();
    return;
  }

  // Additional protection when Origin is absent.
  if (
    fetchSite === 'cross-site' ||
    fetchSite === 'same-site'
  ) {
    res.status(403).json({
      error: 'Yêu cầu liên trang không được phép',
      code: 'CSRF_CROSS_SITE_FORBIDDEN',
    });
    return;
  }

  // Requests without Origin or conflicting Fetch Metadata
  // may come from server-to-server clients or local tools.
  // Such requests still require authentication and RBAC.
  next();
}

export function setupSecurityMiddlewares(
  app: Express
): void {
  app.disable('x-powered-by');

  app.use(helmet());

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
      methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-Id',
      ],
    })
  );

  app.use(csrfOriginProtection);

  app.use(express.json({ limit: '32kb' }));

  app.use(
    express.urlencoded({
      extended: true,
      limit: '32kb',
    })
  );

  app.use(cookieParser(env.COOKIE_SECRET));
}
