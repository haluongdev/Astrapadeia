import {Request,Response,NextFunction} from 'express';
import {pool} from '../config/database.js';
import {BadRequestError,NotFoundError,ConflictError} from '../errors/AppError.js';

const uuid=(x:unknown):x is string=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
const reason=(v:unknown)=>typeof v==='string'&&v.trim().length>=5&&v.trim().length<=500;
const object=(v:unknown)=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const audit=async(c:any,actor:string,action:string,target:string,details:unknown)=>c.query(
 'INSERT INTO audit_logs(actor_id,action,target_id,details) VALUES($1,$2,$3,$4::jsonb)',
 [actor,action,target,JSON.stringify(details)]);
const actor=(req:Request)=>req.account!.id;
const dayLimit=(req:Request)=>Math.max(1,Math.min(365,Number(req.query.days)||90));

export async function planBenefits(req:Request,res:Response,next:NextFunction){
 const id=req.params.id;
 if(!uuid(id)||!object(req.body?.benefits)||!object(req.body?.limits)){
  next(new BadRequestError('ID, quyền lợi hoặc hạn mức không hợp lệ'));return;
 }
 const {benefits,limits}=req.body;
 if(JSON.stringify({benefits,limits}).length>10000 ||
 Object.values(limits).some(x=>!Number.isInteger(x)||Number(x)<0||Number(x)>1000000) ||
 Object.values(benefits).some(x=>typeof x!=='boolean')){
  next(new BadRequestError('Quyền lợi phải là boolean, hạn mức là số nguyên không âm'));return;
 }
 const c=await pool.connect();
 try{
 await c.query('BEGIN');
 const old=await c.query('SELECT benefits FROM vip_plans WHERE id=$1 FOR UPDATE',[id]);
 if(!old.rowCount)throw new NotFoundError('Không có gói PRE');
 const updated=await c.query("UPDATE vip_plans SET benefits=$2::jsonb,updated_at=now() WHERE id=$1 RETURNING *",
 [id,JSON.stringify({features:benefits,limits})]);
 await audit(c,actor(req),'PRE_PLAN_BENEFITS_UPDATE',id,{before:old.rows[0].benefits,after:updated.rows[0].benefits});
 await c.query('COMMIT');res.json(updated.rows[0]);
 }catch(e){await c.query('ROLLBACK');next(e);}finally{c.release();}
}

export async function createManualGrant(req:Request,res:Response,next:NextFunction){
 const {accountId,planId,expiresAt,reason:why}=req.body||{};
 const dt=new Date(expiresAt);
 if(!uuid(accountId)||!uuid(planId)||!reason(why)||!Number.isFinite(dt.getTime())||
 dt.getTime()<=Date.now()||dt.getTime()>Date.now()+3650*86400000){
 next(new BadRequestError('Tài khoản, gói, hạn sử dụng hoặc lý do không hợp lệ'));return;
 }
 const c=await pool.connect();
 try{
 await c.query('BEGIN');
 const a=await c.query("SELECT id,status FROM accounts WHERE id=$1 FOR UPDATE",[accountId]);
 if(!a.rowCount||a.rows[0].status!=='active')throw new BadRequestError('Tài khoản phải đang hoạt động');
 const p=await c.query("SELECT id FROM vip_plans WHERE id=$1",[planId]);
 if(!p.rowCount)throw new NotFoundError('Gói PRE không tồn tại');
 const exists=await c.query("SELECT 1 FROM vip_manual_grants WHERE account_id=$1 AND revoked_at IS NULL AND expires_at>now() LIMIT 1",[accountId]);
 if(exists.rowCount)throw new ConflictError('Tài khoản đã có PRE thủ công hiệu lực. Thu hồi trước khi cấp mới.');
 const {rows}=await c.query(`INSERT INTO vip_manual_grants(account_id,plan_id,expires_at,reason,actor_id)
 VALUES($1,$2,$3,$4,$5) RETURNING *`,[accountId,planId,dt.toISOString(),why.trim(),actor(req)]);
 await audit(c,actor(req),'PRE_MANUAL_GRANT',rows[0].id,{accountId,planId,expiresAt:dt.toISOString(),reason:why.trim()});
 await c.query('COMMIT');res.status(201).json(rows[0]);
 }catch(e){await c.query('ROLLBACK');next(e);}finally{c.release();}
}
export async function revokeManualGrant(req:Request,res:Response,next:NextFunction){
 const id=req.params.id,why=req.body?.reason;
 if(!uuid(id)||!reason(why)){next(new BadRequestError('ID hoặc lý do thu hồi không hợp lệ'));return;}
 const c=await pool.connect();
 try{
 await c.query('BEGIN');
 const {rows,rowCount}=await c.query('SELECT * FROM vip_manual_grants WHERE id=$1 FOR UPDATE',[id]);
 if(!rowCount)throw new NotFoundError('Không có lượt cấp PRE');
 if(rows[0].revoked_at)throw new ConflictError('Đã thu hồi');
 const r=await c.query(`UPDATE vip_manual_grants SET revoked_at=now(),revoked_reason=$2,revoked_by=$3 WHERE id=$1 RETURNING *`,
 [id,why.trim(),actor(req)]);
 await audit(c,actor(req),'PRE_MANUAL_REVOKE',id,{accountId:rows[0].account_id,reason:why.trim()});
 await c.query('COMMIT');res.json(r.rows[0]);
 }catch(e){await c.query('ROLLBACK');next(e);}finally{c.release();}
}
export async function listManualGrants(req:Request,res:Response,next:NextFunction){
 try{
 const {rows}=await pool.query(`SELECT g.id,g.account_id,a.email,g.plan_id,p.name plan_name,g.expires_at,
 g.revoked_at,g.reason,g.revoked_reason,g.created_at
 FROM vip_manual_grants g JOIN accounts a ON a.id=g.account_id
 LEFT JOIN vip_plans p ON p.id=g.plan_id ORDER BY g.created_at DESC LIMIT 200`);
 res.json({items:rows});}catch(e){next(e);}
}
export async function listPromos(_req:Request,res:Response,next:NextFunction){
 try{const {rows}=await pool.query('SELECT * FROM vip_promo_codes ORDER BY created_at DESC LIMIT 200');res.json({items:rows});}catch(e){next(e);}
}
export async function createPromo(req:Request,res:Response,next:NextFunction){
 const b=req.body||{};
 const code=typeof b.code==='string'?b.code.trim().toUpperCase():'';
 if(!/^[A-Z0-9_-]{3,40}$/.test(code)||!['percent','fixed'].includes(b.discountType)||
 !Number.isSafeInteger(b.discountValue)||b.discountValue<=0||
 (b.discountType==='percent'&&b.discountValue>100)||
 (b.usageLimit!==null&&b.usageLimit!==undefined&&(!Number.isInteger(b.usageLimit)||b.usageLimit<1))||
 (b.planId!==undefined&&b.planId!==null&&!uuid(b.planId)) ){
 next(new BadRequestError('Mã giảm giá không hợp lệ'));return;
 }
 const c=await pool.connect();
 try{await c.query('BEGIN');
 const {rows}=await c.query(`INSERT INTO vip_promo_codes(code,discount_type,discount_value,usage_limit,plan_id)
 VALUES($1,$2,$3,$4,$5) RETURNING *`,
 [code,b.discountType,b.discountValue,b.usageLimit??null,b.planId??null]);
 await audit(c,actor(req),'PRE_PROMO_CREATE',rows[0].id,{code,discountType:b.discountType,discountValue:b.discountValue});
 await c.query('COMMIT');res.status(201).json(rows[0]);
 }catch(e){await c.query('ROLLBACK');next(e);}finally{c.release();}
}
export async function togglePromo(req:Request,res:Response,next:NextFunction){
 if(!uuid(req.params.id)||typeof req.body?.active!=='boolean'){next(new BadRequestError('Dữ liệu không hợp lệ'));return;}
 const c=await pool.connect();
 try{await c.query('BEGIN');
 const old=await c.query('SELECT active FROM vip_promo_codes WHERE id=$1 FOR UPDATE',[req.params.id]);
 if(!old.rowCount)throw new NotFoundError('Mã không tồn tại');
 const {rows}=await c.query("UPDATE vip_promo_codes SET active=$2,updated_at=now() WHERE id=$1 RETURNING *",[req.params.id,req.body.active]);
 await audit(c,actor(req),'PRE_PROMO_UPDATE',req.params.id,{old:old.rows[0].active,new:rows[0].active});
 await c.query('COMMIT');res.json(rows[0]);
 }catch(e){await c.query('ROLLBACK');next(e);}finally{c.release();}
}
export async function transactionsDetailed(req:Request,res:Response,next:NextFunction){
 try{
 const valid=['pending','paid','failed','cancelled','refunded','simulated'];
 const status=String(req.query.status||'');
 if(status&&!valid.includes(status))throw new BadRequestError('Bộ lọc trạng thái không hợp lệ');
 const account=String(req.query.account||'');
 const days=dayLimit(req);
 const {rows}=await pool.query(`SELECT t.id,t.account_id,a.email,t.plan_id,p.name plan_name,
 t.provider,t.provider_transaction_id,t.status,t.amount_vnd,t.paid_at,t.refunded_at,t.created_at
 FROM vip_transactions t JOIN accounts a ON a.id=t.account_id JOIN vip_plans p ON p.id=t.plan_id
 WHERE ($1::text='' OR t.status=$1) AND ($2::text='' OR a.email ILIKE '%'||$2||'%')
 AND t.created_at>=now()-($3::int * interval '1 day')
 ORDER BY t.created_at DESC LIMIT 500`,[status,account.slice(0,120),days]);
 res.json({items:rows,providerConfigured:false,note:'Đối soát trạng thái từ dữ liệu đã ghi nhận. Chưa kết nối cổng thanh toán để tự truy vấn lại hoặc hoàn tiền.'});
 }catch(e){next(e);}
}
export async function reconciliation(req:Request,res:Response,next:NextFunction){
 try{
 const {rows}=await pool.query(`SELECT t.id,t.provider,t.provider_transaction_id,t.account_id,t.amount_vnd,
 t.status,t.created_at,EXTRACT(EPOCH FROM(now()-t.created_at))/60 pending_minutes
 FROM vip_transactions t WHERE t.status='pending' AND t.created_at<now()-interval '15 minutes'
 ORDER BY t.created_at ASC LIMIT 200`);
 res.json({items:rows,requiresProviderConnection:true,note:'Danh sách cần đối soát từ cổng thanh toán; hệ thống chưa tự xác nhận thay nhà cung cấp.'});
 }catch(e){next(e);}
}
export async function reporting(req:Request,res:Response,next:NextFunction){
 try{
 const days=dayLimit(req);
 const [daily,monthly,conversion]=await Promise.all([
 pool.query(`SELECT to_char(paid_at,'YYYY-MM-DD') period,count(*)::int transactions,
 coalesce(sum(amount_vnd),0)::text revenue_vnd
 FROM vip_transactions WHERE status='paid' AND paid_at>=now()-($1::int*interval '1 day')
 GROUP BY 1 ORDER BY 1 DESC`,[days]),
 pool.query(`SELECT to_char(paid_at,'YYYY-MM') period,count(*)::int transactions,
 coalesce(sum(amount_vnd),0)::text revenue_vnd
 FROM vip_transactions WHERE status='paid' AND paid_at>=now()-($1::int*interval '1 day')
 GROUP BY 1 ORDER BY 1 DESC`,[days]),
 pool.query(`WITH registered AS (SELECT count(*)::int n FROM accounts a
 JOIN account_roles ar ON ar.account_id=a.id AND ar.role_id='student' WHERE a.status='active'),
 vip AS (SELECT count(DISTINCT a.id)::int n FROM accounts a
 JOIN account_roles ar ON ar.account_id=a.id AND ar.role_id='student'
 WHERE a.status='active' AND (
 EXISTS (SELECT 1 FROM vip_manual_grants g WHERE g.account_id=a.id AND g.revoked_at IS NULL AND g.expires_at>now())
 OR EXISTS (SELECT 1 FROM vip_transactions t JOIN vip_plans p ON p.id=t.plan_id
 WHERE t.account_id=a.id AND t.status='paid' AND t.paid_at IS NOT NULL
 AND t.paid_at+(p.duration_days*interval '1 day')>now())
 )) SELECT registered.n total_students,vip.n active_pre,
 CASE WHEN registered.n=0 THEN 0 ELSE round(100.0*vip.n/registered.n,2) END conversion_pct
 FROM registered,vip`)
 ]);
 res.json({daily:daily.rows,monthly:monthly.rows,conversion:conversion.rows[0],
 note:'Doanh thu chỉ tính bản ghi paid. PRE thủ công không tạo doanh thu. Thời hạn gói thanh toán được ước tính từ paid_at; việc gia hạn cộng dồn chưa tích hợp.'});
 }catch(e){next(e);}
}
