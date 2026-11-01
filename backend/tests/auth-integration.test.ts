import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { hmacSha256 } from '../src/utils/crypto.js';

// Integration tests intentionally write to the configured DEVELOPMENT database.
// Never run against production or a database holding real user data.
test('isolated registration -> activation -> session -> RBAC -> logout', async (t) => {
  assert.equal(env.NODE_ENV, 'development', 'Refusing to run outside development');
  assert.equal(process.env.SCHOLYX_ALLOW_INTEGRATION_TEST, 'yes',
    'Set SCHOLYX_ALLOW_INTEGRATION_TEST=yes explicitly to run');
  const suffix = randomBytes(10).toString('hex');
  const email = `scholyx.integration.${suffix}@example.com`;
  const password = `Integration!${randomBytes(18).toString('hex')}`;
  const otp = '593817';
  let accountId: string | null = null;
  let server: Server | undefined;
  let baseUrl = '';

  function cookieFrom(res: Response): string {
    const value = res.headers.get('set-cookie') || '';
    const match = value.match(/(?:^|,\s*)(sx_session=[^;\s]+)/);
    assert.ok(match, 'Expected sx_session cookie');
    return match[1];
  }

  async function send(path: string, method: string, data?: object, cookie?: string) {
    const headers: Record<string, string> = {
      Origin: env.FRONTEND_ORIGIN,
      'Content-Type': 'application/json',
    };
    if (cookie) headers.Cookie = cookie;
    return fetch(`${baseUrl}${path}`, {
      method, headers, body: data === undefined ? undefined : JSON.stringify(data),
    });
  }

  try {
    server = await new Promise<Server>((resolve, reject) => {
      const s = createApp().listen(0, '127.0.0.1', () => resolve(s));
      s.once('error', reject);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server address unavailable');
    baseUrl = `http://127.0.0.1:${address.port}`;

    await t.test('Register -> HTTP 201 and pending', async () => {
      const res = await send('/api/auth/register', 'POST', {
        fullName: 'Scholyx Integration Test', email, grade: 12, password,
        agreeTerms: true, agreePrivacy: true,
        termsVersion: 'test-v1', privacyVersion: 'test-v1',
      });
      assert.equal(res.status, 201);
      const body = await res.json() as { status?: string };
      assert.equal(body.status, 'pending');
    });

    const { rows } = await pool.query<{ id: string }>(
      'SELECT id FROM accounts WHERE email = $1', [email]);
    assert.equal(rows.length, 1, 'Expected exactly one new test account');
    accountId = rows[0].id;

    // Set the test account's OTP hash only. Real accounts and their OTPs untouched.
    const tokenHash = hmacSha256(otp, env.OTP_SECRET);
    const updated = await pool.query(
      `UPDATE one_time_codes SET token_hash = $1, expires_at = NOW() + INTERVAL '10 minutes',
        attempts = 0, consumed_at = NULL
       WHERE account_id = $2 AND purpose = 'activate' AND consumed_at IS NULL`,
      [tokenHash, accountId]
    );
    assert.equal(updated.rowCount, 1, 'Expected exactly one test OTP');

    await t.test('Activate -> HTTP 200', async () => {
      const res = await send('/api/auth/activate', 'POST', { email, code: otp });
      assert.equal(res.status, 200, `Activation returned ${res.status}: ${await res.text()}`);
    });

    let cookie = '';
    await t.test('Login -> HTTP 200 with session cookie', async () => {
      const res = await send('/api/auth/login', 'POST', { identifier: email, password });
      assert.equal(res.status, 200, `Login returned ${res.status}: ${await res.text()}`);
      cookie = cookieFrom(res);
    });

    await t.test('Authenticated /me -> HTTP 200', async () => {
      const res = await send('/api/auth/me', 'GET', undefined, cookie);
      assert.equal(res.status, 200);
      const body = await res.json() as { user?: { email?: string } };
      assert.equal(body.user?.email, email);
    });

    await t.test('Student admin/accounts -> HTTP 403', async () => {
      const res = await send('/api/admin/accounts', 'GET', undefined, cookie);
      assert.equal(res.status, 403);
    });

    await t.test('Student admin/audit -> HTTP 403', async () => {
      const res = await send('/api/admin/audit', 'GET', undefined, cookie);
      assert.equal(res.status, 403);
    });

    await t.test('Logout -> HTTP 200', async () => {
      const res = await send('/api/auth/logout', 'POST', {}, cookie);
      assert.equal(res.status, 200);
      const body = await res.json() as { ok?: boolean };
      assert.equal(body.ok, true);
    });

    await t.test('Revoked session /me -> HTTP 401', async () => {
      const res = await send('/api/auth/me', 'GET', undefined, cookie);
      assert.equal(res.status, 401);
    });
  } finally {
    // Close server before targeted cleanup.
    if (server) {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        server!.close(err => err ? reject(err) : resolve()));
    }

    // Clean up only the newly generated account; never touch existing users.
    // This cleanup may fail when other FK constraints exist: report it clearly.
    try {
      const found = await pool.query<{ id: string }>(
        'SELECT id FROM accounts WHERE email = $1', [email]);
      const ownId = found.rows[0]?.id;
      if (ownId && (!accountId || ownId === accountId)) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query('DELETE FROM sessions WHERE account_id = $1', [ownId]);
          await client.query('DELETE FROM one_time_codes WHERE account_id = $1', [ownId]);
          await client.query('DELETE FROM audit_logs WHERE actor_id::text = $1 OR target_id::text = $1', [ownId]);
          await client.query('DELETE FROM student_profiles WHERE account_id = $1', [ownId]);
          await client.query('DELETE FROM account_roles WHERE account_id = $1', [ownId]);
          const deleted = await client.query(
            'DELETE FROM accounts WHERE id = $1 AND email = $2', [ownId, email]);
          assert.equal(deleted.rowCount, 1, 'Cleanup did not delete exactly one account');
          await client.query('COMMIT');
          console.log('PASS: Cleaned up test account and related records');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }
    } finally {
      await pool.end();
    }
  }
});