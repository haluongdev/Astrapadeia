import { Request, Response, NextFunction } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../config/database.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/AppError.js';

const rid = /^[a-z][a-z0-9_-]{1,40}$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const lockedRoles = new Set(['student','qtnd','qtv']);
const privileged = 'rbac.manage';
async function record(c: PoolClient, actor: string, action: string, target: string, details: object) {
  await c.query('INSERT INTO audit_logs(actor_id,action,target_id,details) VALUES($1,$2,$3,$4::jsonb)', [actor, action, target, JSON.stringify(details)]);
}
async function tx(req: Request, res: Response, next: NextFunction, work: (c: PoolClient) => Promise<unknown>) {
  const c = await pool.connect(); let begun = false;
  try {
    await c.query('BEGIN'); begun = true;
    // Same advisory lock as the account-state API; serialize all changes to QTV assignments.
    await c.query('SELECT pg_advisory_xact_lock(20261027,4001)');
    const result = await work(c);
    await c.query('COMMIT'); begun = false;
    res.setHeader('Cache-Control','no-store'); res.json(result);
  } catch (e) { if (begun) await c.query('ROLLBACK').catch(() => undefined); next(e); }
  finally { c.release(); }
}
export async function listRoles(_req: Request,res:Response,next:NextFunction) {
 try {
  const [r,p,a] = await Promise.all([
   pool.query(`SELECT r.id,r.description,r.is_system,count(DISTINCT ar.account_id)::int AS account_count,
       coalesce(array_agg(DISTINCT rp.permission_id) FILTER(WHERE rp.permission_id IS NOT NULL),ARRAY[]::text[]) AS permissions
       FROM roles r LEFT JOIN account_roles ar ON ar.role_id=r.id
       LEFT JOIN role_permissions rp ON rp.role_id=r.id GROUP BY r.id ORDER BY r.is_system DESC,r.id`),
   pool.query('SELECT id,description,module,action FROM permissions ORDER BY module,id'),
   pool.query(`SELECT ar.role_id,ar.account_id,a.email,a.full_name,a.status
     FROM account_roles ar JOIN accounts a ON a.id=ar.account_id ORDER BY a.created_at DESC LIMIT 100`)
  ]);
  res.setHeader('Cache-Control','no-store');res.json({roles:r.rows,permissions:p.rows,assignments:a.rows});
 } catch(e){next(e);}
}
export async function accountEffective(req:Request,res:Response,next:NextFunction) {
 try {
  const id=req.params.id;
  if(!uuid.test(id)) throw new BadRequestError('ID không hợp lệ');
  const {rows}=await pool.query(`SELECT coalesce(array_agg(DISTINCT rp.permission_id) FILTER(WHERE rp.permission_id IS NOT NULL),ARRAY[]::text[]) AS permissions
   FROM account_roles ar LEFT JOIN role_permissions rp ON rp.role_id=ar.role_id WHERE ar.account_id=$1`,[id]);
  res.json({accountId:id,permissions:rows[0].permissions});
 }catch(e){next(e);}
}
export async function createRole(req:Request,res:Response,next:NextFunction) {
 const id=String(req.body?.id||'').trim().toLowerCase();
 const description=String(req.body?.description||'').trim();
 if(!rid.test(id)||lockedRoles.has(id)||description.length>300) return next(new BadRequestError('Mã vai trò không hợp lệ'));
 await tx(req,res,next,async c=>{
  const role=await c.query('INSERT INTO roles(id,description,is_system) VALUES($1,$2,false) ON CONFLICT DO NOTHING RETURNING id',[id,description]);
  if(!role.rowCount) throw new BadRequestError('Vai trò đã tồn tại');
  await record(c,req.account!.id,'RBAC_ROLE_CREATE',id,{description});
  return {ok:true,id};
 });
}
export async function updateRole(req:Request,res:Response,next:NextFunction) {
 const id=req.params.id, description=String(req.body?.description||'').trim();
 if(!rid.test(id)||description.length>300) return next(new BadRequestError('Dữ liệu không hợp lệ'));
 await tx(req,res,next,async c=>{
  const r=await c.query('SELECT * FROM roles WHERE id=$1 FOR UPDATE',[id]);
  if(!r.rowCount) throw new NotFoundError('Vai trò không tồn tại');
  if(r.rows[0].is_system) throw new ForbiddenError('Không được sửa vai trò mặc định');
  await c.query('UPDATE roles SET description=$2 WHERE id=$1',[id,description]);
  await record(c,req.account!.id,'RBAC_ROLE_UPDATE',id,{before:r.rows[0].description,after:description});
  return {ok:true};
 });
}
export async function deleteRole(req:Request,res:Response,next:NextFunction) {
 const id=req.params.id;
 if(!rid.test(id)) return next(new BadRequestError('Vai trò không hợp lệ'));
 await tx(req,res,next,async c=>{
  const role=await c.query('SELECT is_system FROM roles WHERE id=$1 FOR UPDATE',[id]);
  if(!role.rowCount) throw new NotFoundError('Vai trò không tồn tại');
  if(role.rows[0].is_system || lockedRoles.has(id)) throw new ForbiddenError('Không thể xóa vai trò mặc định');
  const linked=await c.query('SELECT 1 FROM account_roles WHERE role_id=$1 LIMIT 1',[id]);
  if(linked.rowCount) throw new ForbiddenError('Không thể xóa vai trò đang được gán');
  await c.query('DELETE FROM role_permissions WHERE role_id=$1',[id]);
  await c.query('DELETE FROM roles WHERE id=$1',[id]);
  await record(c,req.account!.id,'RBAC_ROLE_DELETE',id,{});
  return {ok:true};
 });
}
export async function setPermissions(req:Request,res:Response,next:NextFunction) {
 const id=req.params.id, permissions=req.body?.permissions;
 if(!rid.test(id)||!Array.isArray(permissions)||permissions.length>200||permissions.some(x=>typeof x!=='string')||new Set(permissions).size!==permissions.length)
  return next(new BadRequestError('Tập quyền không hợp lệ'));
 await tx(req,res,next,async c=>{
  const role=await c.query('SELECT id FROM roles WHERE id=$1 FOR UPDATE',[id]);
  if(!role.rowCount) throw new NotFoundError('Vai trò không tồn tại');
  // Never disable the sole administrator path or bypass admin-account safeguards.
  if(id==='qtv' && (!permissions.includes(privileged)||!permissions.includes('admin.accounts'))) throw new ForbiddenError('Không được bỏ quyền quản trị cốt lõi của QTV');
  const known=await c.query('SELECT id FROM permissions WHERE id=ANY($1::text[])',[permissions]);
  if(known.rowCount!==permissions.length) throw new BadRequestError('Quyền không tồn tại');
  const prev=await c.query('SELECT permission_id FROM role_permissions WHERE role_id=$1 ORDER BY permission_id',[id]);
  await c.query('DELETE FROM role_permissions WHERE role_id=$1',[id]);
  for(const p of permissions) await c.query('INSERT INTO role_permissions(role_id,permission_id) VALUES($1,$2)',[id,p]);
  await record(c,req.account!.id,'RBAC_PERMISSIONS_UPDATE',id,{before:prev.rows.map(x=>x.permission_id),after:permissions});
  return {ok:true};
 });
}
export async function changeAssignment(req:Request,res:Response,next:NextFunction) {
 const id=req.params.id, role=String(req.body?.role||''), mode=String(req.body?.mode||'');
 if(!uuid.test(id)||!rid.test(role)||!['grant','revoke'].includes(mode)) return next(new BadRequestError('Thao tác không hợp lệ'));
 await tx(req,res,next,async c=>{
  const target=await c.query('SELECT id,status FROM accounts WHERE id=$1 FOR UPDATE',[id]);
  if(!target.rowCount) throw new NotFoundError('Không tìm thấy tài khoản');
  const exists=await c.query('SELECT 1 FROM roles WHERE id=$1',[role]);
  if(!exists.rowCount) throw new BadRequestError('Vai trò không tồn tại');
  const current=await c.query('SELECT role_id FROM account_roles WHERE account_id=$1',[id]);
  const assignments=current.rows.map(x=>x.role_id);
  if(mode==='grant'){
   if(assignments.includes(role)) throw new BadRequestError('Tài khoản đã có vai trò');
   await c.query('INSERT INTO account_roles(account_id,role_id) VALUES($1,$2)',[id,role]);
  }else{
   if(!assignments.includes(role)) throw new BadRequestError('Tài khoản không có vai trò');
   if(assignments.length===1) throw new ForbiddenError('Tài khoản phải có ít nhất một vai trò');
   if(role==='qtv') {
    if(id===req.account!.id) throw new ForbiddenError('QTV không được tự gỡ vai trò QTV');
    if(target.rows[0].status==='active') {
     const cnt=await c.query(`SELECT count(*)::int AS n FROM accounts a WHERE a.status='active'
      AND EXISTS(SELECT 1 FROM account_roles ar WHERE ar.account_id=a.id AND ar.role_id='qtv')`);
     if(cnt.rows[0].n<=1) throw new ForbiddenError('Không thể gỡ vai trò QTV hoạt động cuối cùng');
    }
   }
   await c.query('DELETE FROM account_roles WHERE account_id=$1 AND role_id=$2',[id,role]);
  }
  await c.query(`UPDATE sessions SET revoked_at=now() WHERE account_id=$1 AND revoked_at IS NULL`,[id]);
  await record(c,req.account!.id,mode==='grant'?'RBAC_ROLE_GRANT':'RBAC_ROLE_REVOKE',id,{role,before:assignments,after:mode==='grant'?[...assignments,role]:assignments.filter(x=>x!==role)});
  return {ok:true};
 });
}
