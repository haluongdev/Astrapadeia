// Local-only operator tool. Never reuse an existing account or password.
import pg from 'pg';
import argon2 from 'argon2';
const email=(process.env.SCHOLYX_NEW_QTND_EMAIL||'').trim().toLowerCase();
const password=process.env.SCHOLYX_NEW_QTND_PASSWORD||'';
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12 ||
 !/[A-Z]/.test(password)||!/[a-z]/.test(password)||!/[0-9]/.test(password)){
 console.error('STOP: Valid email and strong password (12+ chars, upper/lower/digit) required.');
 process.exit(2);
}
if(!process.env.DATABASE_URL){console.error('STOP: Missing DATABASE_URL');process.exit(2);}
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
const c=await pool.connect();let begun=false;
try{
 await c.query('BEGIN');begun=true;
 const exists=await c.query('SELECT id FROM accounts WHERE lower(email)= $1',[email]);
 if(exists.rowCount){throw Error('STOP: Account already exists. Use QTV invitation/RBAC management, not auto-promote.');}
 const hash=await argon2.hash(password,{type:argon2.argon2id});
 const acc=await c.query(`INSERT INTO accounts(full_name,email,grade,password_hash,status,
  consent_terms_version,consent_privacy_version)
  VALUES('QTND Content Editor',$1,NULL,$2,'active','internal-operator','internal-operator')
  RETURNING id`,[email,hash]);
 await c.query("INSERT INTO account_roles(account_id,role_id) VALUES($1,'qtnd')",[acc.rows[0].id]);
 await c.query(`INSERT INTO audit_logs(actor_id,action,target_id,details) VALUES
 (NULL,'LOCAL_QTND_PROVISION',$1,$2::jsonb)`,[acc.rows[0].id,JSON.stringify({role:'qtnd',method:'local-operator'})]);
 await c.query('COMMIT');begun=false;
 console.log('PASS: QTND account created; login:',email,'role=qtnd');
}catch(e){if(begun)await c.query('ROLLBACK');console.error(e.message);process.exitCode=1;}
finally{c.release();await pool.end();}
