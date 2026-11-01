import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { BadRequestError } from '../errors/AppError.js';

function filters(req: Request) {
  const q = (v: unknown, n = 100) => typeof v === 'string' ? v.trim().slice(0,n) : '';
  const actor = q(req.query.actor);
  const action = q(req.query.action);
  const target = q(req.query.target);
  const start = q(req.query.start, 32);
  const end = q(req.query.end, 32);
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if ((start && (!dateRe.test(start) || !Number.isFinite(Date.parse(start)))) ||
      (end && (!dateRe.test(end) || !Number.isFinite(Date.parse(end)))) ||
      (start && end && start > end)) throw new BadRequestError('Khoảng ngày không hợp lệ');
  return { actor, action, target, start, end };
}
const where = `WHERE ($1::text = '' OR COALESCE(a.email,'') ILIKE '%'||$1||'%' OR COALESCE(a.full_name,'') ILIKE '%'||$1||'%')
 AND ($2::text = '' OR l.action ILIKE '%'||$2||'%')
 AND ($3::text = '' OR COALESCE(l.target_id,'') ILIKE '%'||$3||'%')
 AND ($4::text = '' OR l.created_at >= $4::date)
 AND ($5::text = '' OR l.created_at < ($5::date + INTERVAL '1 day'))`;
function values(req: Request) {
  const f = filters(req);
  return [f.actor, f.action, f.target, f.start, f.end];
}
const auditSql = `SELECT l.id, l.actor_id, a.email AS actor_email, l.action,
 l.target_id, l.details, l.created_at
 FROM audit_logs l LEFT JOIN accounts a ON a.id=l.actor_id ${where}
 ORDER BY l.id DESC`;

export async function systemOverview(_req:Request,res:Response,next:NextFunction):Promise<void> {
  try {
    const [accounts,roles,sessions,deletion] = await Promise.all([
      pool.query("SELECT count(*)::int total, count(*) FILTER(WHERE status='active')::int active, count(*) FILTER(WHERE status='locked')::int locked, count(*) FILTER(WHERE status='disabled')::int disabled, count(*) FILTER(WHERE status='pending')::int pending FROM accounts"),
      pool.query("SELECT r.id, count(ar.account_id)::int accounts FROM roles r LEFT JOIN account_roles ar ON ar.role_id=r.id GROUP BY r.id ORDER BY r.id"),
      pool.query("SELECT count(DISTINCT account_id)::int today FROM sessions WHERE created_at >= date_trunc('day',now())"),
      pool.query("SELECT count(*) FILTER (WHERE status='new')::int pending FROM deletion_requests"),
    ]);
    res.setHeader('Cache-Control','no-store');
    res.json({accounts: accounts.rows[0], roles:roles.rows, loginAccountsToday:sessions.rows[0].today,
      pendingDeletionRequests:deletion.rows[0].pending,
      learningAttempts:null,examAttempts:null,aiQuestions:null,
      metricsNote:'Lượt học, thi và AI cần bảng sự kiện nghiệp vụ có nguồn dữ liệu xác thực; chưa tích hợp.'});
  } catch(err){next(err);}
}
export async function systemAudit(req:Request,res:Response,next:NextFunction):Promise<void> {
  try {
    const page = Math.max(1, Math.min(100000, parseInt(String(req.query.page ?? '1'),10)||1));
    const limit = Math.max(1,Math.min(100,parseInt(String(req.query.limit ?? '30'),10)||30));
    const v=values(req);
    const [result, count] = await Promise.all([
      pool.query(auditSql + ' LIMIT $6 OFFSET $7',[...v,limit,(page-1)*limit]),
      pool.query(`SELECT count(*)::int total FROM audit_logs l LEFT JOIN accounts a ON a.id=l.actor_id ${where}`,v)
    ]);
    res.setHeader('Cache-Control','no-store');
    res.json({items:result.rows,total:count.rows[0].total,page,limit});
  } catch(err){next(err);}
}
function csvCell(v:unknown):string {
  let s = v == null?'':String(v);
  // Protect spreadsheet software from formula injection
  if (/^[\s]*[=+\-@]/.test(s)) s="'"+s;
  return '"'+s.replace(/"/g,'""').replace(/\r?\n/g,' ')+'"';
}
export async function systemAuditCsv(req:Request,res:Response,next:NextFunction):Promise<void> {
  try {
    const v=values(req);
    const rows=(await pool.query(auditSql+' LIMIT 10000',v)).rows;
    const lines=['id,actor_email,action,target_id,details,created_at'];
    for(const r of rows) lines.push([r.id,r.actor_email,r.action,r.target_id,JSON.stringify(r.details ?? {}),new Date(r.created_at).toISOString()].map(csvCell).join(','));
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Content-Disposition','attachment; filename="scholyx-audit.csv"');
    res.send('\uFEFF'+lines.join('\r\n'));
  } catch(err){next(err);}
}
export async function systemDeletionRequests(_req:Request,res:Response,next:NextFunction):Promise<void>{
  try{
    const {rows}=await pool.query(`SELECT d.id, d.account_id, d.status, d.created_at,d.handled_at,
      a.email FROM deletion_requests d LEFT JOIN accounts a ON a.id=d.account_id
      ORDER BY d.created_at DESC LIMIT 100`);
    res.setHeader('Cache-Control','no-store');
    res.json({items:rows,notice:'Chỉ theo dõi. Chưa triển khai xóa hoặc ẩn danh dữ liệu cá nhân.'});
  }catch(err){next(err);}
}
