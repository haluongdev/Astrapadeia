import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import pg from 'pg';
import argon2 from 'argon2';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

const { Pool } = pg;
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit:'32kb' }));
app.use(cookieParser());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders:'draft-7', legacyHeaders:false }));

const hash = v => createHash('sha256').update(v).digest('hex');
const safeCompare = (a,b) => a.length === b.length && timingSafeEqual(Buffer.from(a),Buffer.from(b));
const cookieOptions = { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/' };
function fail(res,code,message){ return res.status(code).json({error:message}); }
function validEmail(value){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function publicAccount(u){ return { id:u.id,fullName:u.full_name,email:u.email,phone:u.phone,grade:u.grade,status:u.status }; }
async function audit(client,actor,action,target,details={}) {
  await client.query('INSERT INTO audit_logs(actor_id,action,target_id,details) VALUES ($1,$2,$3,$4)',
  [actor||null,action,target||null,JSON.stringify(details)]);
}
async function issueCode(client,accountId,purpose) {
  const code=String(randomBytes(4).readUInt32BE() % 1000000).padStart(6,'0');
  await client.query(`UPDATE one_time_codes SET consumed_at=now() WHERE account_id=$1 AND purpose=$2 AND consumed_at IS NULL`,[accountId,purpose]);
  await client.query(`INSERT INTO one_time_codes(account_id,purpose,token_hash,expires_at)
    VALUES($1,$2,$3,now()+interval '10 minutes')`,[accountId,purpose,hash(code)]);
  // DEV ONLY. Replace with verified email/SMS delivery before releasing to users.
  if (process.env.NODE_ENV!=='production') console.info(`[DEV ONLY] ${purpose} OTP for ${accountId}: ${code}`);
  return code;
}
async function requireAuth(req,res,next) {
  try {
    const token=req.cookies.sx_session;
    if(!token) return fail(res,401,'Vui lòng đăng nhập');
    const {rows}=await db.query(`SELECT a.*,s.id AS sid FROM sessions s JOIN accounts a ON a.id=s.account_id
      WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>now()
      AND s.last_seen_at>now()-interval '30 minutes' AND a.status='active'`,[hash(token)]);
    if (!rows.length) return fail(res,401,'Phiên đăng nhập hết hạn');
    req.account=rows[0];
    await db.query(`UPDATE sessions SET last_seen_at=now() WHERE id=$1`,[rows[0].sid]);
    next();
  } catch(e){next(e);}
}
function requireRole(role) {
  return async (req,res,next)=>{
    try {
      const {rowCount}=await db.query('SELECT 1 FROM account_roles WHERE account_id=$1 AND role_id=$2',[req.account.id,role]);
      if(!rowCount) return fail(res,403,'Không có quyền truy cập');
      next();
    }catch(e){next(e);}
  };
}
app.get('/api/health', (_req,res)=>res.json({ok:true}));
app.post('/api/auth/register',async(req,res,next)=>{
  const {fullName,email,grade,password,agreeTerms,agreePrivacy,termsVersion,privacyVersion}=req.body;
  const normalizedEmail=typeof email==='string'?email.trim().toLowerCase():'';
  if(typeof fullName!=='string'||!fullName.trim()||!validEmail(normalizedEmail)||![10,11,12].includes(Number(grade))||
     typeof password!=='string'||password.length<8||password.length>128||agreeTerms!==true||agreePrivacy!==true||
     !termsVersion||!privacyVersion) return fail(res,400,'Thông tin đăng ký không hợp lệ');
  const client=await db.connect();
  try {
    await client.query('BEGIN');
    const encoded=await argon2.hash(password,{type:argon2.argon2id});
    const {rows}=await client.query(`INSERT INTO accounts(full_name,email,grade,password_hash,consent_terms_version,consent_privacy_version)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,[fullName.trim(),normalizedEmail,Number(grade),encoded,termsVersion,privacyVersion]);
    await client.query('INSERT INTO account_roles(account_id,role_id) VALUES($1,$2)',[rows[0].id,'student']);
    await client.query('INSERT INTO student_profiles(account_id) VALUES($1)',[rows[0].id]);
    await issueCode(client,rows[0].id,'activate');
    await audit(client,rows[0].id,'REGISTER_PENDING',rows[0].id);
    await client.query('COMMIT');
    return res.status(201).json({status:'pending',message:'Đã tạo tài khoản chờ kích hoạt'});
  } catch(e) {
    await client.query('ROLLBACK');
    if(e.code==='23505') return fail(res,409,'Email đã được sử dụng');
    next(e);
  }finally{client.release();}
});
app.post('/api/auth/activate',async(req,res,next)=>{
  const email=String(req.body.email||'').trim().toLowerCase();
  const code=String(req.body.code||'');
  if(!validEmail(email)||!/^\d{6}$/.test(code)) return fail(res,400,'Mã xác thực không hợp lệ');
  const client=await db.connect();
  try {
    await client.query('BEGIN');
    const {rows}=await client.query(`SELECT c.*,a.status FROM one_time_codes c
      JOIN accounts a ON a.id=c.account_id WHERE a.email=$1 AND c.purpose='activate'
      AND c.consumed_at IS NULL ORDER BY c.created_at DESC LIMIT 1 FOR UPDATE OF c`,[email]);
    const c=rows[0];
    if(!c||c.status!=='pending'||new Date(c.expires_at)<=new Date()||c.attempts>=5) {
      await client.query('ROLLBACK'); return fail(res,400,'Mã đã hết hạn hoặc không hợp lệ');
    }
    if(!safeCompare(c.token_hash,hash(code))){
      await client.query('UPDATE one_time_codes SET attempts=attempts+1,consumed_at=CASE WHEN attempts+1>=5 THEN now() ELSE NULL END WHERE id=$1',[c.id]);
      await client.query('COMMIT');
      return fail(res,400,'Mã không chính xác hoặc đã hết lượt thử');
    }
    await client.query('UPDATE one_time_codes SET consumed_at=now() WHERE id=$1',[c.id]);
    await client.query(`UPDATE accounts SET status='active' WHERE id=$1`,[c.account_id]);
    await audit(client,c.account_id,'ACCOUNT_ACTIVATED',c.account_id);
    await client.query('COMMIT');
    res.json({status:'active'});
  }catch(e){await client.query('ROLLBACK');next(e);}finally{client.release();}
});
app.post('/api/auth/login',async(req,res,next)=>{
  const identifier=String(req.body.identifier||'').trim().toLowerCase();
  const password=req.body.password;
  if(!identifier||typeof password!=='string') return fail(res,400,'Thiếu thông tin đăng nhập');
  const client=await db.connect();
  try{
    await client.query('BEGIN');
    const {rows}=await client.query('SELECT * FROM accounts WHERE email=$1 OR phone=$1 FOR UPDATE',[identifier]);
    const a=rows[0];
    if(!a){await client.query('ROLLBACK');return fail(res,401,'Thông tin đăng nhập không chính xác');}
    if(a.locked_until && new Date(a.locked_until)>new Date()) {
      await client.query('ROLLBACK');return fail(res,423,'Tài khoản đang bị khóa tạm thời');
    }
    const verified=await argon2.verify(a.password_hash,password);
    if(!verified){
      await client.query(`UPDATE accounts SET failed_logins=CASE WHEN failed_logins+1>=5 THEN 0 ELSE failed_logins+1 END,
        locked_until=CASE WHEN failed_logins+1>=5 THEN now()+interval '15 minutes' ELSE locked_until END WHERE id=$1`,[a.id]);
      await audit(client,a.id,'LOGIN_FAILED',a.id);
      await client.query('COMMIT');
      return fail(res,401,'Thông tin đăng nhập không chính xác');
    }
    if(a.status!=='active'){await client.query('ROLLBACK');return fail(res,403,'Tài khoản chưa kích hoạt hoặc đã bị vô hiệu');}
    await client.query('UPDATE accounts SET failed_logins=0,locked_until=NULL WHERE id=$1',[a.id]);
    const token=randomBytes(32).toString('hex');
    await client.query(`INSERT INTO sessions(account_id,token_hash,expires_at)
      VALUES($1,$2,now()+interval '12 hours')`,[a.id,hash(token)]);
    await audit(client,a.id,'LOGIN_SUCCESS',a.id);
    await client.query('COMMIT');
    res.cookie('sx_session',token,{...cookieOptions,maxAge:12*60*60*1000});
    res.json({user:publicAccount(a)});
  }catch(e){await client.query('ROLLBACK');next(e);}finally{client.release();}
});
app.get('/api/auth/me',requireAuth,(req,res)=>res.json({user:publicAccount(req.account)}));
app.post('/api/auth/logout',requireAuth,async(req,res,next)=>{
  try{
    await db.query('UPDATE sessions SET revoked_at=now() WHERE id=$1',[req.account.sid]);
    res.clearCookie('sx_session',cookieOptions);
    res.json({ok:true});
  }catch(e){next(e);}
});
app.get('/api/profile',requireAuth,async(req,res,next)=>{
  try{
    const {rows}=await db.query('SELECT * FROM student_profiles WHERE account_id=$1',[req.account.id]);
    res.json({user:publicAccount(req.account),profile:rows[0]||null});
  }catch(e){next(e);}
});
app.patch('/api/profile',requireAuth,async(req,res,next)=>{
  try{
    const {school,province,selectedSubjects,targetScores,targetExamDate,aiPersonalization}=req.body;
    if (selectedSubjects!==undefined && (!Array.isArray(selectedSubjects) || !selectedSubjects.every(s=>typeof s==='string')))
      return fail(res,400,'Môn học không hợp lệ');
    const {rows}=await db.query(`UPDATE student_profiles SET
      school=COALESCE($2,school),province=COALESCE($3,province),
      selected_subjects=COALESCE($4,selected_subjects),
      target_scores=COALESCE($5,target_scores),
      target_exam_date=COALESCE($6,target_exam_date),
      ai_personalization=COALESCE($7,ai_personalization)
      WHERE account_id=$1 RETURNING *`,
      [req.account.id,school??null,province??null,selectedSubjects??null,targetScores?JSON.stringify(targetScores):null,targetExamDate??null,aiPersonalization??null]);
    res.json({profile:rows[0]});
  }catch(e){next(e);}
});
app.post('/api/profile/delete-request',requireAuth,async(req,res,next)=>{
  try{
    await db.query('INSERT INTO deletion_requests(account_id) VALUES($1)',[req.account.id]);
    await db.query('INSERT INTO audit_logs(actor_id,action,target_id) VALUES($1,$2,$3)',[req.account.id,'DATA_DELETION_REQUEST',req.account.id]);
    res.status(202).json({status:'new'});
  }catch(e){next(e);}
});
app.get('/api/admin/accounts',requireAuth,requireRole('qtv'),async(req,res,next)=>{
  try{
    const q=String(req.query.q||'').slice(0,100);
    const {rows}=await db.query(`SELECT id,full_name,email,phone,grade,status,created_at FROM accounts
      WHERE full_name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT 100`,[`%${q}%`]);
    res.json({items:rows});
  }catch(e){next(e);}
});
app.get('/api/admin/audit',requireAuth,requireRole('qtv'),async(req,res,next)=>{
  try {
    const {rows}=await db.query('SELECT id,actor_id,action,target_id,details,created_at FROM audit_logs ORDER BY id DESC LIMIT 100');
    res.json({items:rows});
  }catch(e){next(e);}
});
app.use((err,req,res,next)=>{
  console.error('Server error',err.code||err.name);
  res.status(500).json({error:'Lỗi máy chủ, vui lòng thử lại'});
});
app.listen(Number(process.env.PORT||4000),()=>console.log(`Scholyx API listening at http://localhost:${process.env.PORT||4000}`));
