import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

let server: Server;
let base = '';

before(async () => {
  server = await new Promise<Server>((resolve, reject) => {
    const s = createApp().listen(0, '127.0.0.1', () => resolve(s));
    s.once('error', reject);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test port');
  base = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server) return;
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => {
    server.close(err => err ? reject(err) : resolve());
  });
});

async function request(path: string, method = 'GET', body?: unknown) {
  return fetch(base + path, {
    method,
    headers: body === undefined ? {} : {
      'Content-Type': 'application/json',
      'Origin': env.FRONTEND_ORIGIN,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test('Auth: guest /me responds 401', async () => {
  assert.equal((await request('/api/auth/me')).status, 401);
});
test('Auth: missing login identifier responds 400', async () => {
  assert.equal((await request('/api/auth/login', 'POST', { password: 'test' })).status, 400);
});
test('Auth: missing login password responds 400', async () => {
  assert.equal((await request('/api/auth/login', 'POST', { identifier: 'nobody@example.invalid' })).status, 400);
});
test('Auth: nonexistent email login responds 401', async () => {
  assert.equal((await request('/api/auth/login', 'POST', {
    identifier: 'scholyx-regression-nonexistent@example.invalid',
    password: 'invalid-test-password',
  })).status, 401);
});
test('Auth: invalid registration responds 400', async () => {
  assert.equal((await request('/api/auth/register', 'POST', {
    fullName: '', email: 'bad', grade: 7, password: '123',
    agreeTerms: false, agreePrivacy: false,
  })).status, 400);
});
test('RBAC: guest admin/accounts responds 401', async () => {
  assert.equal((await request('/api/admin/accounts')).status, 401);
});
test('RBAC: guest admin/audit responds 401', async () => {
  assert.equal((await request('/api/admin/audit')).status, 401);
});
test('Auth: guest logout responds 401', async () => {
  assert.equal((await request('/api/auth/logout', 'POST', {})).status, 401);
});