import { Request, Response, NextFunction } from 'express';
import { PoolClient } from 'pg';
import { randomBytes, createHash } from 'node:crypto';
import argon2 from 'argon2';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError.js';

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const digest=(token:string)=>createHash('sha256').update(token).digest('hex');
const providerConfigured=()=>Boolean(process.env.RESEND_API_KEY && process.env.SCHOLYX_MAIL_FROM);

async function sendMail(to:string, subject:string, link:string):Promise<void>{
 if(!providerConfigured()) throw new Error('EMAIL_NOT_CONFIGURED');
 const sender=process.env.SCHOLYX_MAIL_FROM!;
 const response=await fetch('https://api.resend.com/emails',{
   method:'POST',signal:AbortSignal.timeout(12000),
   headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type':'application/json'},
   body:JSON.stringify({
     from:sender,to:[to],subject,
     text:`Scholyx\n\nMở liên kết sau để tự đặt mật khẩu (hiệu lực 30 phút, dùng một lần):\n${link}\n\nNếu không yêu cầu, hãy bỏ qua email này.`
   })
 });
 if(!response.ok) throw new Error('EMAIL_DELIVERY_FAILED');
}
async function record(client:PoolClient, actor:string, action:string, id:string, details:Record<string,unknown>={}){
 await client.query('INSERT INTO audit_logs(actor_id,action,target_id,details) VALUES ($1,$2,$3,$4)',[actor,action,id,JSON.stringify(details)]);
}
function errorToClient(error:unknown,next:NextFunction){
 if(error instanceof Error && error.message==='EMAIL_NOT_CONFIGURED'){next(new BadRequestError('Chưa cấu hình dịch vụ email. Cần RESEND_API_KEY và SCHOLYX_MAIL_FROM trong backend/.env.'));return;}
 if(error instanceof Error && error.message==='EMAIL_DELIVERY_FAILED'){next(new BadRequestError('Nhà cung cấp email từ chối gửi. Không có thay đổi tài khoản.'));return;}
 next(error);
}
async function createLink(client:PoolClient,accountId:string,purpose:'invite'|'reset',actor:string){
 const token=randomBytes(32).toString('hex');
 await client.query("UPDATE admin_account_links SET used_at=NOW() WHERE account_id=$1 AND purpose=$2 AND used_at IS NULL",[accountId,purpose]);
 await client.query("INSERT INTO admin_account_links(account_id,purpose,token_hash,expires_at,created_by) VALUES ($1,$2,$3,NOW()+INTERVAL '30 minutes',$4)",
 [accountId,purpose,digest(token),actor]);
 const link=new URL('/admin-password.html',env.FRONTEND_ORIGIN);
 // URL fragment avoids token transmission in HTTP requests, access logs, and Referer headers.
 link.hash=new URLSearchParams({token,purpose}).toString();
 return link.toString();
}
export async function inviteInternal(req:Request,res:Response,next:NextFunction){
 let client:PoolClient|undefined;
 try{
  const fullName=typeof req.body?.fullName==='string'?req.body.fullName.trim():'';
  const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
  const role=req.body?.role;
  if(fullName.length<2||fullName.length>150||email.length>254||!emailPattern.test(email)||!['qtnd','qtv'].includes(role)) throw new BadRequestError('Họ tên, email hoặc vai trò không hợp lệ');
  if(!providerConfigured()) throw new Error('EMAIL_NOT_CONFIGURED');
  client=await pool.connect();
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(20261027,4002)');
  const exists=await client.query('SELECT id FROM accounts WHERE lower(email)=lower($1)',[email]);
  if(exists.rowCount) throw new ConflictError('Email đã tồn tại. Không tạo tài khoản trùng.');
  const randomSecret=await argon2.hash(randomBytes(32),{type:argon2.argon2id});
  const created=await client.query(
   `INSERT INTO accounts(full_name,email,password_hash,status,consent_terms_version,consent_privacy_version)
    VALUES($1,$2,$3,'pending','not-accepted','not-accepted') RETURNING id`,
   [fullName,email,randomSecret]);
  const id=created.rows[0].id;
  await client.query('INSERT INTO account_roles(account_id,role_id) VALUES ($1,$2)',[id,role]);
  const link=await createLink(client,id,'invite',req.account!.id);
  await sendMail(email,'Scholyx - Mời thiết lập tài khoản nội bộ',link);
  await record(client,req.account!.id,'ADMIN_ACCOUNT_INVITED',id,{role,email});
  await client.query('COMMIT');
  res.setHeader('Cache-Control','no-store');
  res.status(201).json({ok:true,message:'Đã gửi liên kết thiết lập mật khẩu tới email người nhận.',id});
 }catch(e){
  if(client)try{await client.query('ROLLBACK');}catch{}
  errorToClient(e,next);
 }finally{client?.release();}
}
export async function requestAdminReset(req:Request,res:Response,next:NextFunction){
 let client:PoolClient|undefined;
 try{
  const id=req.params.id;
  if(!uuidPattern.test(id)) throw new BadRequestError('ID không hợp lệ');
  if(!providerConfigured()) throw new Error('EMAIL_NOT_CONFIGURED');
  client=await pool.connect();
  await client.query('BEGIN');
  const result=await client.query('SELECT id,email,status FROM accounts WHERE id=$1 FOR UPDATE',[id]);
  const account=result.rows[0];
  if(!account||!account.email||account.status!=='active') throw new BadRequestError('Chỉ có thể gửi cho tài khoản đang hoạt động có email');
  const link=await createLink(client,id,'reset',req.account!.id);
  await sendMail(account.email,'Scholyx - Đặt lại mật khẩu',link);
  await record(client,req.account!.id,'ADMIN_ACCOUNT_RESET_LINK_SENT',id);
  await client.query('COMMIT');
  res.setHeader('Cache-Control','no-store');
  res.json({ok:true,message:'Đã gửi liên kết đặt lại mật khẩu tới email tài khoản.'});
 }catch(e){if(client)try{await client.query('ROLLBACK');}catch{} errorToClient(e,next);}
 finally{client?.release();}
}
export async function consumeAdminLink(req:Request,res:Response,next:NextFunction){
 let client:PoolClient|undefined;
 try{
  const token=typeof req.body?.token==='string'?req.body.token:'';
  const purpose=req.body?.purpose;
  const password=req.body?.password;
  const agreeTerms=req.body?.agreeTerms===true;
  const agreePrivacy=req.body?.agreePrivacy===true;
  if(!/^[0-9a-f]{64}$/.test(token)||!['invite','reset'].includes(purpose)||
     typeof password!=='string'||password.length<8||password.length>1024)
     throw new BadRequestError('Liên kết hoặc mật khẩu không hợp lệ');
  if(purpose==='invite'&&(!agreeTerms||!agreePrivacy)) throw new BadRequestError('Cần đồng ý điều khoản và chính sách quyền riêng tư');
  client=await pool.connect();await client.query('BEGIN');
  const result=await client.query(
   `SELECT l.id,l.account_id,l.purpose,a.status FROM admin_account_links l
    JOIN accounts a ON a.id=l.account_id
    WHERE l.token_hash=$1 AND l.used_at IS NULL AND l.expires_at>NOW() AND l.purpose=$2
    FOR UPDATE OF l,a`,[digest(token),purpose]);
  const row=result.rows[0];
  if(!row||(purpose==='invite'&&row.status!=='pending')||(purpose==='reset'&&row.status!=='active'))
   throw new BadRequestError('Liên kết không hợp lệ, đã dùng hoặc hết hạn');
  const passwordHash=await argon2.hash(password,{type:argon2.argon2id});
  if(purpose==='invite'){
   await client.query(`UPDATE accounts SET password_hash=$2,status='active',failed_logins=0,locked_until=NULL,
    consent_terms_version='accepted-on-invite',consent_privacy_version='accepted-on-invite',consent_at=NOW()
    WHERE id=$1`,[row.account_id,passwordHash]);
  }else{
   await client.query('UPDATE accounts SET password_hash=$2,failed_logins=0,locked_until=NULL WHERE id=$1',[row.account_id,passwordHash]);
  }
  await client.query('UPDATE admin_account_links SET used_at=NOW() WHERE account_id=$1 AND used_at IS NULL',[row.account_id]);
  await client.query('UPDATE sessions SET revoked_at=NOW() WHERE account_id=$1 AND revoked_at IS NULL',[row.account_id]);
  await record(client,row.account_id,purpose==='invite'?'ADMIN_ACCOUNT_INVITE_ACCEPTED':'ADMIN_ACCOUNT_EMAIL_RESET_COMPLETED',row.account_id);
  await client.query('COMMIT');
  res.setHeader('Cache-Control','no-store');
  res.json({ok:true,message:'Mật khẩu đã được thiết lập. Bạn có thể đăng nhập.'});
 }catch(e){if(client)try{await client.query('ROLLBACK');}catch{}next(e);}
 finally{client?.release();}
}
