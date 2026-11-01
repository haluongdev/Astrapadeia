
import { Request, Response, NextFunction } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import argon2 from 'argon2';
import {
  sha256,
  hmacSha256,
  safeCompare,
  generateRandomToken,
  generateNumericOtp,
} from '../utils/crypto.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  LockedError,
  ForbiddenError,
} from '../errors/AppError.js';
import { Account, PublicAccount } from '../types/index.js';
import { COOKIE_NAME } from '../middlewares/auth.middleware.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

function toPublicAccount(u: Account): Omit<PublicAccount, 'role'> {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    grade: u.grade,
    status: u.status,
  };
}

// SCHOLYX_DB_ROLE_SYNC_V1: roles are always resolved server-side.
async function publicAccountWithRole(
  account: Account
): Promise<PublicAccount> {
  const { rows } = await pool.query<{ role_id: string }>(
    `SELECT role_id FROM account_roles
     WHERE account_id = $1 AND role_id IN ('qtv', 'qtnd', 'student')`,
    [account.id]
  );
  const roles = new Set(rows.map(row => row.role_id));
  const role: 'qtv' | 'qtnd' | 'student' =
    roles.has('qtv') ? 'qtv' :
    roles.has('qtnd') ? 'qtnd' : 'student';
  return { ...toPublicAccount(account), role };
}

async function logAudit(
  client: PoolClient,
  actor: string | null,
  action: string,
  target: string | null,
  details = {}
): Promise<void> {
  await client.query(
    'INSERT INTO audit_logs(actor_id, action, target_id, details) VALUES ($1, $2, $3, $4)',
    [actor, action, target, JSON.stringify(details)]
  );
}

const SCHOLYX_DEV_OTP_INBOX_V1 = new Map<
  string,
  { code: string; expiresAt: number }
>();

async function issueCode(
  client: PoolClient,
  accountId: string,
  purpose: 'activate' | 'reset'
): Promise<string> {
  const code = generateNumericOtp(6);
  const codeHash = hmacSha256(code, env.OTP_SECRET);

  await client.query(
    `UPDATE one_time_codes
     SET consumed_at = NOW()
     WHERE account_id = $1
       AND purpose = $2
       AND consumed_at IS NULL`,
    [accountId, purpose]
  );

  await client.query(
    `INSERT INTO one_time_codes(account_id, purpose, token_hash, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
    [accountId, purpose, codeHash]
  );

  if (env.NODE_ENV === 'development') {
    console.info(`[DEV ONLY] ${purpose} OTP for ${accountId}: ${code}`);
  }

  if (env.NODE_ENV === 'development' && env.DEMO_MODE) {
    SCHOLYX_DEV_OTP_INBOX_V1.set(accountId, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
  }

  return code;
}

export async function devOtpInbox(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const remote = req.socket.remoteAddress || '';
    const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
      .includes(remote);

    const localHost = [
      `localhost:${env.PORT}`,
      `127.0.0.1:${env.PORT}`,
    ].includes(req.headers.host || '');

    if (
      env.NODE_ENV !== 'development' ||
      !env.DEMO_MODE ||
      !loopback ||
      !localHost ||
      req.headers.origin !== env.FRONTEND_ORIGIN
    ) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim()
      : '';

    if (!email || email.length > 254) {
      res.status(400).json({ error: 'Invalid email' });
      return;
    }

    const result = await pool.query(
      `SELECT id FROM accounts
       WHERE LOWER(email) = LOWER($1)
         AND status = 'pending'
       LIMIT 1`,
      [email]
    );

    const accountId = result.rows[0]?.id;
    const entry = accountId
      ? SCHOLYX_DEV_OTP_INBOX_V1.get(accountId)
      : undefined;

    if (!entry || Date.now() >= entry.expiresAt) {
      if (accountId) SCHOLYX_DEV_OTP_INBOX_V1.delete(accountId);
      res.status(404).json({
        error: 'No active development OTP found',
      });
      return;
    }

    // The OTP is available only in this local development session.
    res.setHeader('Cache-Control', 'no-store');
    res.json({ code: entry.code });
  } catch (error) {
    next(error);
  }
}
async function rollbackIfOpen(
  client: PoolClient | undefined,
  transactionOpen: boolean
): Promise<void> {
  if (!client || !transactionOpen) {
    return;
  }

  try {
    await client.query('ROLLBACK');
  } catch (rollbackError) {
    console.error('Database rollback failed:', rollbackError);
  }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let client: PoolClient | undefined;
  let transactionOpen = false;

  try {
    const {
      fullName,
      email,
      grade,
      password,
      agreeTerms,
      agreePrivacy,
      termsVersion,
      privacyVersion,
    } = req.body;

    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';

    const cfgRows = await pool.query(
      "SELECT key,value FROM system_settings WHERE key IN ('registration_enabled','minimum_password_length')"
    );
    const cfg = Object.fromEntries(cfgRows.rows.map((r: {key:string,value:unknown}) => [r.key,r.value]));
    if (cfg.registration_enabled === false) throw new ForbiddenError('Hệ thống đang tạm dừng đăng ký mới');
    const requiredPasswordLength = Number(cfg.minimum_password_length ?? 8);

    if (
      typeof fullName !== 'string' ||
      !fullName.trim() ||
      !normalizedEmail.includes('@') ||
      ![10, 11, 12].includes(Number(grade)) ||
      typeof password !== 'string' ||
      password.length < requiredPasswordLength ||
      agreeTerms !== true ||
      agreePrivacy !== true ||
      !termsVersion ||
      !privacyVersion
    ) {
      throw new BadRequestError(
        'Thông tin đăng ký không hợp lệ hoặc thiếu thỏa thuận'
      );
    }

    client = await pool.connect();

    await client.query('BEGIN');
    transactionOpen = true;

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const { rows } = await client.query(
      `INSERT INTO accounts(
        full_name,
        email,
        grade,
        password_hash,
        consent_terms_version,
        consent_privacy_version
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [
        fullName.trim(),
        normalizedEmail,
        Number(grade),
        passwordHash,
        termsVersion,
        privacyVersion,
      ]
    );

    const accountId = rows[0].id;

    await client.query(
      'INSERT INTO account_roles(account_id, role_id) VALUES ($1, $2)',
      [accountId, 'student']
    );

    await client.query(
      'INSERT INTO student_profiles(account_id) VALUES ($1)',
      [accountId]
    );

    await issueCode(client, accountId, 'activate');

    await logAudit(
      client,
      accountId,
      'REGISTER_PENDING',
      accountId
    );

    await client.query('COMMIT');
    transactionOpen = false;

    res.status(201).json({
      status: 'pending',
      message: 'Đã tạo tài khoản chờ kích hoạt',
    });
  } catch (error: any) {
    await rollbackIfOpen(client, transactionOpen);

    if (error?.code === '23505') {
      next(new ConflictError('Email đã được sử dụng trong hệ thống'));
      return;
    }

    next(error);
  } finally {
    client?.release();
  }
}

export async function activate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let client: PoolClient | undefined;
  let transactionOpen = false;

  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();

    const code = String(req.body.code || '');

    if (!email || !/^\d{6}$/.test(code)) {
      throw new BadRequestError('Mã xác thực không hợp lệ');
    }

    client = await pool.connect();

    await client.query('BEGIN');
    transactionOpen = true;

    const { rows } = await client.query(
      `SELECT c.*, a.status
       FROM one_time_codes c
       JOIN accounts a ON a.id = c.account_id
       WHERE a.email = $1
         AND c.purpose = 'activate'
         AND c.consumed_at IS NULL
       ORDER BY c.created_at DESC
       LIMIT 1
       FOR UPDATE OF c`,
      [email]
    );

    const c = rows[0];

    if (
      !c ||
      c.status !== 'pending' ||
      new Date(c.expires_at) <= new Date() ||
      c.attempts >= 5
    ) {
      throw new BadRequestError(
        'Mã xác thực đã hết hạn hoặc không hợp lệ'
      );
    }

    const providedHash = hmacSha256(code, env.OTP_SECRET);

    if (!safeCompare(c.token_hash, providedHash)) {
      await client.query(
        `UPDATE one_time_codes
         SET attempts = attempts + 1,
             consumed_at = CASE
               WHEN attempts + 1 >= 5 THEN NOW()
               ELSE NULL
             END
         WHERE id = $1`,
        [c.id]
      );

      // Persist the failed OTP attempt before returning the error.
      await client.query('COMMIT');
      transactionOpen = false;

      throw new BadRequestError(
        'Mã xác thực không chính xác hoặc đã vượt quá 5 lần thử'
      );
    }

    await client.query(
      'UPDATE one_time_codes SET consumed_at = NOW() WHERE id = $1',
      [c.id]
    );

    await client.query(
      "UPDATE accounts SET status = 'active' WHERE id = $1",
      [c.account_id]
    );

    await logAudit(
      client,
      c.account_id,
      'ACCOUNT_ACTIVATED',
      c.account_id
    );

    await client.query('COMMIT');
    transactionOpen = false;

    res.json({
      status: 'active',
      message: 'Kích hoạt tài khoản thành công',
    });
  } catch (error) {
    await rollbackIfOpen(client, transactionOpen);
    next(error);
  } finally {
    client?.release();
  }
}

// SCHOLYX_PASSWORD_RESET_V1
const RESET_REQUEST_MESSAGE =
  'Nếu tài khoản hợp lệ, hướng dẫn đặt lại mật khẩu đã được xử lý';

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let client: PoolClient | undefined;
  let transactionOpen = false;

  try {
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';

    if (!email || email.length > 254 || !email.includes('@')) {
      throw new BadRequestError('Địa chỉ email không hợp lệ');
    }

    client = await pool.connect();
    await client.query('BEGIN');
    transactionOpen = true;

    const { rows } = await client.query(
      `SELECT id FROM accounts
       WHERE email = $1 AND status = 'active'
       FOR UPDATE`,
      [email]
    );

    let resetCode: string | undefined;

    if (rows.length) {
      resetCode = await issueCode(client, rows[0].id, 'reset');

      await logAudit(
        client,
        rows[0].id,
        'PASSWORD_RESET_REQUESTED',
        rows[0].id
      );
    }

    await client.query('COMMIT');
    transactionOpen = false;

    // The code may be shown ONLY to the local development browser.
    // Never enable this response on a public QA or production server.
    const remote = req.socket.remoteAddress || '';
    const localRemote = [
      '127.0.0.1', '::1', '::ffff:127.0.0.1'
    ].includes(remote);

    const localHost = [
      `localhost:${env.PORT}`,
      `127.0.0.1:${env.PORT}`
    ].includes(req.headers.host || '');

    const allowLocalDevCode =
      env.NODE_ENV === 'development' &&
      env.DEMO_MODE &&
      localRemote &&
      localHost &&
      req.headers.origin === env.FRONTEND_ORIGIN;

    res.setHeader('Cache-Control', 'no-store');
    res.json({
      message: RESET_REQUEST_MESSAGE,
      ...(allowLocalDevCode && resetCode
        ? { devOtp: resetCode }
        : {})
    });
  } catch (error) {
    await rollbackIfOpen(client, transactionOpen);
    next(error);
  } finally {
    client?.release();
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let client: PoolClient | undefined;
  let transactionOpen = false;

  try {
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';

    const code = req.body?.code;
    const newPassword = req.body?.newPassword;

    if (
      !email ||
      email.length > 254 ||
      !/^\d{6}$/.test(code) ||
      typeof newPassword !== 'string' ||
      newPassword.length < 8 ||
      newPassword.length > 1024
    ) {
      throw new BadRequestError('Thông tin đặt lại mật khẩu không hợp lệ');
    }

    client = await pool.connect();
    await client.query('BEGIN');
    transactionOpen = true;

    const { rows } = await client.query(
      `SELECT c.*, a.status
       FROM one_time_codes c
       JOIN accounts a ON a.id = c.account_id
       WHERE a.email = $1
         AND c.purpose = 'reset'
         AND c.consumed_at IS NULL
       ORDER BY c.created_at DESC
       LIMIT 1
       FOR UPDATE OF c`,
      [email]
    );

    const otp = rows[0];

    if (
      !otp ||
      otp.status !== 'active' ||
      new Date(otp.expires_at) <= new Date() ||
      otp.attempts >= 5
    ) {
      throw new BadRequestError(
        'Mã khôi phục đã hết hạn hoặc không hợp lệ'
      );
    }

    const providedHash = hmacSha256(code, env.OTP_SECRET);

    if (!safeCompare(otp.token_hash, providedHash)) {
      await client.query(
        `UPDATE one_time_codes
         SET attempts = attempts + 1,
             consumed_at = CASE
               WHEN attempts + 1 >= 5 THEN NOW()
               ELSE NULL
             END
         WHERE id = $1`,
        [otp.id]
      );

      await client.query('COMMIT');
      transactionOpen = false;

      throw new BadRequestError(
        'Mã khôi phục không chính xác hoặc đã vượt quá 5 lần thử'
      );
    }

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id
    });

    await client.query(
      `UPDATE accounts
       SET password_hash = $1,
           failed_logins = 0,
           locked_until = NULL
       WHERE id = $2`,
      [passwordHash, otp.account_id]
    );

    await client.query(
      `UPDATE one_time_codes
       SET consumed_at = NOW()
       WHERE id = $1`,
      [otp.id]
    );

    await client.query(
      `UPDATE one_time_codes
       SET consumed_at = NOW()
       WHERE account_id = $1
         AND purpose = 'reset'
         AND consumed_at IS NULL`,
      [otp.account_id]
    );

    await client.query(
      `UPDATE sessions
       SET revoked_at = NOW()
       WHERE account_id = $1
         AND revoked_at IS NULL`,
      [otp.account_id]
    );

    await logAudit(
      client,
      otp.account_id,
      'PASSWORD_RESET_SUCCESS',
      otp.account_id
    );

    await client.query('COMMIT');
    transactionOpen = false;

    res.json({
      ok: true,
      message: 'Đặt lại mật khẩu thành công'
    });
  } catch (error) {
    await rollbackIfOpen(client, transactionOpen);
    next(error);
  } finally {
    client?.release();
  }
}
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let client: PoolClient | undefined;
  let transactionOpen = false;

  try {
    const identifier = String(req.body.identifier || '')
      .trim()
      .toLowerCase();

    const password = req.body.password;

    if (!identifier || typeof password !== 'string') {
      throw new BadRequestError('Thiếu thông tin đăng nhập');
    }

    client = await pool.connect();

    await client.query('BEGIN');
    transactionOpen = true;

    const { rows } = await client.query(
      'SELECT * FROM accounts WHERE email = $1 OR phone = $1 FOR UPDATE',
      [identifier]
    );

    const a = rows[0];

    if (!a) {
      throw new UnauthorizedError(
        'Thông tin đăng nhập không chính xác'
      );
    }

    if (
      a.locked_until &&
      new Date(a.locked_until) > new Date()
    ) {
      throw new LockedError(
        'Tài khoản đang bị khóa tạm thời do nhập sai nhiều lần'
      );
    }

    const verified = await argon2.verify(
      a.password_hash,
      password
    );

    if (!verified) {
      await client.query(
        `UPDATE accounts
         SET failed_logins = CASE
               WHEN failed_logins + 1 >= 5 THEN 0
               ELSE failed_logins + 1
             END,
             locked_until = CASE
               WHEN failed_logins + 1 >= 5
                 THEN NOW() + INTERVAL '${process.env.NODE_ENV === 'production' ? '15 minutes' : '5 seconds'}'
               ELSE locked_until
             END
         WHERE id = $1`,
        [a.id]
      );

      await logAudit(
        client,
        a.id,
        'LOGIN_FAILED',
        a.id
      );

      // Persist failed login count and audit log.
      await client.query('COMMIT');
      transactionOpen = false;

      throw new UnauthorizedError(
        'Thông tin đăng nhập không chính xác'
      );
    }

    if (a.status !== 'active') {
      throw new ForbiddenError(
        'Tài khoản chưa được kích hoạt hoặc đã bị vô hiệu hóa'
      );
    }

    await client.query(
      `UPDATE accounts
       SET failed_logins = 0,
           locked_until = NULL,
           last_login_at = NOW()
       WHERE id = $1`,
      [a.id]
    );

    const token = generateRandomToken(32);
    const tokenHash = sha256(token);

    await client.query(
      `INSERT INTO sessions(account_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '12 hours')`,
      [a.id, tokenHash]
    );

    await logAudit(
      client,
      a.id,
      'LOGIN_SUCCESS',
      a.id
    );

    await client.query('COMMIT');
    transactionOpen = false;

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.json({
      user: await publicAccountWithRole(a),
    });
  } catch (error) {
    await rollbackIfOpen(client, transactionOpen);
    next(error);
  } finally {
    client?.release();
  }
}

export async function me(
  req: Request,
  res: Response
): Promise<void> {
  res.json({
    user: await publicAccountWithRole(req.account!),
  });
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.account?.sid) {
      await pool.query(
        'UPDATE sessions SET revoked_at = NOW() WHERE id = $1',
        [req.account.sid]
      );
    }

    res.clearCookie(COOKIE_NAME, cookieOptions);

    res.json({
      ok: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    next(error);
  }
}
