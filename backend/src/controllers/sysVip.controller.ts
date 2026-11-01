import { Request,Response,NextFunction } from 'express';
import { pool } from '../config/database.js';
import { BadRequestError,NotFoundError } from '../errors/AppError.js';

const isUuid=(s:unknown)=>typeof s==='string' && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(s);
const cfgKeys=['registration_enabled','minimum_password_length','ai_enabled','vip_sales_enabled','session_idle_minutes','failed_login_threshold'];
const valueOk=(k:string,v:unknown)=>
  ['registration_enabled','ai_enabled','vip_sales_enabled'].includes(k) ? typeof v==='boolean' :
  k==='minimum_password_length' ? Number.isInteger(v) && Number(v)>=8 && Number(v)<=128 :
  k==='session_idle_minutes' ? Number.isInteger(v) && Number(v)>=5 && Number(v)<=240 :
  k==='failed_login_threshold' ? Number.isInteger(v) && Number(v)>=3 && Number(v)<=20 : false;
const audit=async (c:any,actor:string,action:string,target:string,details:any)=>
  c.query('INSERT INTO audit_logs(actor_id,action,target_id,details) VALUES($1,$2,$3,$4::jsonb)',[actor,action,target,JSON.stringify(details)]);

export async function getSettings(_req:Request,res:Response,next:NextFunction){
 try { const {rows}=await pool.query("SELECT key,value,updated_at FROM system_settings ORDER BY key");
 res.setHeader('Cache-Control','no-store');
 res.json({items:rows, note:'Chỉ registration_enabled và minimum_password_length được backend áp dụng trong bản này. Các tham số còn lại được lưu nhưng chưa có hiệu lực toàn hệ thống.'}); }catch(e){next(e);}
}
export async function changeSetting(req:Request,res:Response,next:NextFunction){
 const key=String(req.params.key||'');const value=req.body?.value;
 if(!cfgKeys.includes(key)||!valueOk(key,value)){next(new BadRequestError('Tham số hoặc giá trị không hợp lệ'));return;}
 const c=await pool.connect();try{await c.query('BEGIN');
 const old=await c.query('SELECT value FROM system_settings WHERE key=$1 FOR UPDATE',[key]);
 await c.query(`INSERT INTO system_settings(key,value,updated_by) VALUES($1,$2::jsonb,$3)
 ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_by=EXCLUDED.updated_by,updated_at=now()`,[key,JSON.stringify(value),req.account!.id]);
 await audit(c,req.account!.id,'SYSTEM_SETTING_UPDATE',key,{old:old.rows[0]?.value??null,new:value});
 await c.query('COMMIT');res.json({ok:true,key,value,applied:['registration_enabled','minimum_password_length'].includes(key)});
 }catch(e){await c.query('ROLLBACK');next(e);}finally{c.release();}
}
export async function processDeletion(req:Request,res:Response,next:NextFunction){
 const id=req.params.id; const status=req.body?.status;
 if(!isUuid(id)||!['in_review','rejected'].includes(status)){next(new BadRequestError('Chỉ cho phép đánh dấu đang xem xét hoặc từ chối; không giả lập xóa dữ liệu'));return;}
 const reason=typeof req.body?.reason==='string'?req.body.reason.trim():'';
 if(reason.length<5){next(new BadRequestError('Cần lý do ít nhất 5 ký tự'));return;}
 const c=await pool.connect();try{await c.query('BEGIN');
 const r=await c.query('SELECT status,account_id FROM deletion_requests WHERE id=$1 FOR UPDATE',[id]);
 if(!r.rowCount) throw new NotFoundError('Không tìm thấy yêu cầu');
 if(!['new','in_review'].includes(r.rows[0].status)) throw new BadRequestError('Yêu cầu đã kết thúc');
 await c.query('UPDATE deletion_requests SET status=$2,handled_at=CASE WHEN $2=$3 THEN now() ELSE NULL END WHERE id=$1',[id,status,'rejected']);
 await audit(c,req.account!.id,'DATA_DELETION_REVIEW',id,{oldStatus:r.rows[0].status,newStatus:status,reason,accountId:r.rows[0].account_id});
 await c.query('COMMIT');res.json({ok:true,status});
 }catch(e){await c.query('ROLLBACK');next(e);}finally{c.release();}
}
export async function listPlans(_req:Request,res:Response,next:NextFunction){
 try{const {rows}=await pool.query('SELECT * FROM vip_plans ORDER BY created_at DESC LIMIT 100');res.json({items:rows});}catch(e){next(e);}
}
export async function createPlan(req:Request,res:Response,next:NextFunction){
 const {name,durationDays,priceVnd,description,benefits}=req.body||{};
 if(typeof name!=='string'||!name.trim()||name.length>120||!Number.isInteger(durationDays)||durationDays<1||durationDays>3650||!Number.isSafeInteger(priceVnd)||priceVnd<0||
 (description!==undefined&&typeof description!=='string')||(benefits!==undefined&&(typeof benefits!=='object'||benefits===null||Array.isArray(benefits)))){
 next(new BadRequestError('Thông tin gói VIP không hợp lệ'));return;}
 const c=await pool.connect();try{await c.query('BEGIN');
 const {rows}=await c.query(`INSERT INTO vip_plans(name,duration_days,price_vnd,description,benefits)
 VALUES($1,$2,$3,$4,$5::jsonb) RETURNING *`,[name.trim(),durationDays,priceVnd,(description||'').slice(0,1000),JSON.stringify(benefits||{})]);
 await audit(c,req.account!.id,'VIP_PLAN_CREATE',rows[0].id,{name,priceVnd,durationDays});
 await c.query('COMMIT');res.status(201).json(rows[0]);
 }catch(e){await c.query('ROLLBACK');next(e);}finally{c.release();}
}
export async function updatePlan(req:Request,res:Response,next:NextFunction){
 const id=req.params.id; if(!isUuid(id)){next(new BadRequestError('ID không hợp lệ'));return;}
 const {name,durationDays,priceVnd,description,benefits,active}=req.body||{};
 if((name!==undefined&&(typeof name!=='string'||!name.trim()||name.length>120))||
 (durationDays!==undefined&&(!Number.isInteger(durationDays)||durationDays<1||durationDays>3650))||
 (priceVnd!==undefined&&(!Number.isSafeInteger(priceVnd)||priceVnd<0))||
 (description!==undefined&&typeof description!=='string')||
 (benefits!==undefined&&(typeof benefits!=='object'||!benefits||Array.isArray(benefits)))||
 (active!==undefined&&typeof active!=='boolean')){next(new BadRequestError('Dữ liệu không hợp lệ'));return;}
 const c=await pool.connect();try{await c.query('BEGIN');
 const old=await c.query('SELECT * FROM vip_plans WHERE id=$1 FOR UPDATE',[id]);
 if(!old.rowCount)throw new NotFoundError('Không tìm thấy gói');
 const {rows}=await c.query(`UPDATE vip_plans SET name=$2,duration_days=$3,price_vnd=$4,
 description=$5,benefits=$6::jsonb,active=$7,updated_at=now() WHERE id=$1 RETURNING *`,
 [id,name??old.rows[0].name,durationDays??old.rows[0].duration_days,priceVnd??Number(old.rows[0].price_vnd),description??old.rows[0].description,JSON.stringify(benefits??old.rows[0].benefits),active??old.rows[0].active]);
 await audit(c,req.account!.id,'VIP_PLAN_UPDATE',id,{before:old.rows[0],after:rows[0]});
 await c.query('COMMIT');res.json(rows[0]);
 }catch(e){await c.query('ROLLBACK');next(e);}finally{c.release();}
}
export async function vipTransactions(req:Request,res:Response,next:NextFunction){
 try{const status=String(req.query.status||'');
 if(status&&!['pending','paid','failed','cancelled','refunded'].includes(status))throw new BadRequestError('Bộ lọc không hợp lệ');
 const {rows}=await pool.query(`SELECT t.id,t.created_at,t.status,t.amount_vnd,t.provider,t.provider_transaction_id,
 a.email,p.name plan_name FROM vip_transactions t JOIN accounts a ON a.id=t.account_id
 JOIN vip_plans p ON p.id=t.plan_id WHERE ($1::text='' OR t.status=$1) ORDER BY t.created_at DESC LIMIT 100`,[status]);
 res.json({items:rows,note:'Chỉ hiển thị giao dịch được ghi nhận từ cổng thanh toán đã xác minh. Chưa cấu hình cổng thanh toán.'});}catch(e){next(e);}
}
export async function vipReport(_req:Request,res:Response,next:NextFunction){
 try{const [monthly,active]=await Promise.all([
 pool.query(`SELECT to_char(paid_at,'YYYY-MM') AS "month",sum(amount_vnd)::text AS revenue
 FROM vip_transactions WHERE status='paid' AND paid_at IS NOT NULL GROUP BY 1 ORDER BY 1 DESC LIMIT 24`),
 pool.query(`SELECT count(DISTINCT account_id)::int active_vip FROM vip_manual_grants
 WHERE revoked_at IS NULL AND expires_at>now()`) ]);
 res.json({monthly:monthly.rows,activeManualGrants:active.rows[0].active_vip,
 note:'Doanh thu chỉ từ giao dịch paid có chứng từ; chưa kết nối cổng thanh toán, dữ liệu có thể trống. VIP thủ công không tính doanh thu.'});
 }catch(e){next(e);}
}
