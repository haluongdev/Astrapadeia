import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/AppError.js';

const uuid = (s: unknown): s is string =>
  typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function plans(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(
      'SELECT id,name,duration_days,price_vnd,description,benefits FROM vip_plans WHERE active=true ORDER BY price_vnd,id'
    );
    res.json({items:result.rows, mode:'simulation'});
  } catch (error) { next(error); }
}
export async function mine(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pool.query(
      `SELECT t.id,t.status,t.amount_vnd,t.provider,t.created_at,t.demo_completed_at,
        p.name AS plan_name,p.duration_days FROM vip_transactions t
        JOIN vip_plans p ON p.id=t.plan_id
        WHERE t.account_id=$1 ORDER BY t.created_at DESC LIMIT 100`,
      [req.account!.id]
    );
    res.json({items:result.rows});
  } catch (error) { next(error); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  if (!uuid(req.body?.planId)) { next(new BadRequestError('Gói PRE không hợp lệ')); return; }
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const plan = await c.query('SELECT id,price_vnd FROM vip_plans WHERE id=$1 AND active=true FOR SHARE', [req.body.planId]);
    if (!plan.rowCount) throw new NotFoundError('Gói PRE không còn mở bán');
    const r = await c.query(
      `INSERT INTO vip_transactions(account_id,plan_id,provider,status,amount_vnd)
       VALUES($1,$2,'scholyx_demo','pending',$3) RETURNING id,status,amount_vnd,created_at`,
      [req.account!.id,req.body.planId,plan.rows[0].price_vnd]
    );
    await c.query('COMMIT');
    res.status(201).json({transaction:r.rows[0],mode:'simulation'});
  } catch(error) { await c.query('ROLLBACK'); next(error); }
  finally {c.release();}
}
export async function simulate(req: Request, res: Response, next: NextFunction) {
  if (!uuid(req.params.id)) { next(new BadRequestError('Mã giao dịch không hợp lệ')); return; }
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const old = await c.query(
      `SELECT id,status FROM vip_transactions WHERE id=$1 AND account_id=$2
       AND provider='scholyx_demo' FOR UPDATE`,
      [req.params.id,req.account!.id]
    );
    if (!old.rowCount) throw new NotFoundError('Không tìm thấy giao dịch mô phỏng');
    if (old.rows[0].status !== 'pending') throw new ConflictError('Giao dịch đã hoàn tất hoặc không còn chờ');
    const updated = await c.query(
      `UPDATE vip_transactions SET status='simulated',demo_completed_at=now()
       WHERE id=$1 RETURNING id,status,demo_completed_at`,[req.params.id]
    );
    await c.query('COMMIT');
    res.json({transaction:updated.rows[0],note:'Giao dịch mô phỏng; chưa thu tiền và chưa kích hoạt PRE.'});
  } catch(error) { await c.query('ROLLBACK'); next(error); }
  finally {c.release();}
}
