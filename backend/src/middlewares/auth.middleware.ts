import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { sha256 } from '../utils/crypto.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { Account } from '../types/index.js';

export const COOKIE_NAME = 'sx_session';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      throw new UnauthorizedError('Vui lòng đăng nhập để tiếp tục');
    }

    const tokenHash = sha256(token);
    const { rows } = await pool.query<Account & { sid: string }>(
      `SELECT a.id, a.full_name, a.email, a.phone, a.grade, a.status, s.id AS sid
       FROM sessions s
       JOIN accounts a ON a.id = s.account_id
       WHERE s.token_hash = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > NOW()
         AND s.last_seen_at > NOW() - INTERVAL '30 minutes'
         AND a.status = 'active'`,
      [tokenHash]
    );

    if (!rows.length) {
      throw new UnauthorizedError('Phiên đăng nhập đã hết hạn');
    }

    req.account = rows[0];

    // Refresh last_seen_at
    await pool.query('UPDATE sessions SET last_seen_at = NOW() WHERE id = $1', [rows[0].sid]);

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(role: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.account) {
        throw new UnauthorizedError('Vui lòng đăng nhập');
      }

      const { rowCount } = await pool.query(
        'SELECT 1 FROM account_roles WHERE account_id = $1 AND role_id = $2',
        [req.account.id, role]
      );

      if (!rowCount) {
        throw new ForbiddenError('Không có quyền truy cập');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
