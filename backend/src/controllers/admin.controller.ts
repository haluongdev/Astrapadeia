import { Request, Response, NextFunction } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../config/database.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/AppError.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses = ['active', 'pending', 'locked', 'disabled'];
const roles = ['student', 'qtnd', 'qtv'];

async function audit(client: PoolClient, actor: string, action: string, target: string, details: Record<string, unknown>) {
  await client.query(
    'INSERT INTO audit_logs(actor_id, action, target_id, details) VALUES ($1,$2,$3,$4)',
    [actor, action, target, JSON.stringify(details)]
  );
}

export async function getAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const role = typeof req.query.role === 'string' ? req.query.role : '';
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    if ((role && !roles.includes(role)) || (status && !statuses.includes(status))) {
      throw new BadRequestError('Bộ lọc không hợp lệ');
    }
    const page = Math.max(1, Math.min(100000, Number.parseInt(String(req.query.page ?? '1'), 10) || 1));
    const limit = Math.max(1, Math.min(50, Number.parseInt(String(req.query.limit ?? '20'), 10) || 20));
    const params = [q, role, status, limit, (page - 1) * limit];
    const filter = `WHERE ($1 = '' OR a.full_name ILIKE '%' || $1 || '%' OR a.email ILIKE '%' || $1 || '%' OR a.phone ILIKE '%' || $1 || '%')
      AND ($2 = '' OR EXISTS (SELECT 1 FROM account_roles r WHERE r.account_id=a.id AND r.role_id=$2))
      AND ($3 = '' OR a.status=$3)`;
    const { rows } = await pool.query(
      `SELECT a.id, a.full_name, a.email, a.phone, a.grade, a.status, a.created_at,
              COALESCE(array_agg(ar.role_id) FILTER (WHERE ar.role_id IS NOT NULL), ARRAY[]::text[]) AS roles,
              COUNT(*) OVER()::int AS total
       FROM accounts a LEFT JOIN account_roles ar ON ar.account_id=a.id
       ${filter}
       GROUP BY a.id ORDER BY a.created_at DESC, a.id LIMIT $4 OFFSET $5`, params
    );
    res.setHeader('Cache-Control', 'no-store');
    res.json({ items: rows.map(({ total, ...account }) => account), total: rows[0]?.total || 0, page, limit });
  } catch (error) { next(error); }
}

export async function getAuditLogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rows } = await pool.query(
      'SELECT id, actor_id, action, target_id, details, created_at FROM audit_logs ORDER BY id DESC LIMIT 100'
    );
    res.setHeader('Cache-Control', 'no-store');
    res.json({ items: rows });
  } catch (error) { next(error); }
}

export async function manageAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  let client: PoolClient | undefined;
  let open = false;
  try {
    const accountId = req.params.id;
    const action = req.params.action;
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
    if (!uuid.test(accountId) || !['lock', 'unlock', 'disable', 'force-logout'].includes(action)) {
      throw new BadRequestError('Thao tác không hợp lệ');
    }
    if (['lock','unlock','disable'].includes(action) && (reason.length < 5 || reason.length > 500)) {
      throw new BadRequestError('Phải nhập lý do từ 5 đến 500 ký tự');
    }
    client = await pool.connect();
    await client.query('BEGIN');
    open = true;
    // Serialize administrator-state changes, including simultaneous requests.
    await client.query('SELECT pg_advisory_xact_lock(20261027, 4001)');
    const { rows } = await client.query(
      `SELECT a.id, a.status,
              EXISTS (SELECT 1 FROM account_roles r WHERE r.account_id=a.id AND r.role_id='qtv') AS is_qtv
       FROM accounts a WHERE a.id=$1 FOR UPDATE OF a`, [accountId]
    );
    const target = rows[0];
    if (!target) throw new NotFoundError('Không tìm thấy tài khoản');

    // Never allow a privileged actor to lock/disable their own active session.
    if (accountId === req.account!.id && ['lock', 'disable'].includes(action)) {
      throw new ForbiddenError('Không thể tự khóa hoặc vô hiệu hóa tài khoản đang quản trị');
    }
    if (target.is_qtv && ['lock','disable'].includes(action) && target.status === 'active') {
      const result = await client.query(
        `SELECT count(*)::int AS count FROM accounts a
         WHERE a.status='active'
           AND EXISTS (SELECT 1 FROM account_roles r WHERE r.account_id=a.id AND r.role_id='qtv')`
      );
      if (result.rows[0].count <= 1) throw new ForbiddenError('Không thể khóa QTV hoạt động cuối cùng');
    }
    if (action === 'unlock' && target.status !== 'locked') {
      throw new BadRequestError('Chỉ có thể mở khóa tài khoản đang khóa');
    }
    if (action === 'lock' && target.status !== 'active') {
      throw new BadRequestError('Chỉ khóa tài khoản đang hoạt động');
    }
    if (action === 'disable' && target.status === 'disabled') {
      throw new BadRequestError('Tài khoản đã vô hiệu hóa');
    }
    const newStatus = action === 'lock' ? 'locked' : action === 'unlock' ? 'active' : action === 'disable' ? 'disabled' : target.status;
    if (newStatus !== target.status) {
      await client.query(
        `UPDATE accounts SET status=$2, locked_until=NULL, failed_logins=0 WHERE id=$1`,
        [accountId, newStatus]
      );
    }
    let revokedSessions = 0;
    if (['lock','disable','force-logout'].includes(action)) {
      const revoked = await client.query(
        `UPDATE sessions SET revoked_at=NOW()
         WHERE account_id=$1 AND revoked_at IS NULL
         RETURNING id`, [accountId]
      );
      revokedSessions = revoked.rowCount || 0;
    }
    await audit(client, req.account!.id, `ADMIN_ACCOUNT_${action.toUpperCase().replace('-', '_')}`, accountId, {
      reason: reason || 'QTV yêu cầu buộc đăng xuất', oldStatus: target.status, newStatus,
      revokedSessions
    });
    await client.query('COMMIT');
    open = false;
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, id: accountId, status: newStatus, revokedSessions });
  } catch (error) {
    if (open && client) {
      try { await client.query('ROLLBACK'); } catch (e) { console.error('Admin rollback failed', e); }
    }
    next(error);
  } finally { client?.release(); }
}
