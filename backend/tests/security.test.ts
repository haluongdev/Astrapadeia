
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';

let server: Server;
let baseUrl: string;

before(async () => {
  const app = createApp();

  server = await new Promise<Server>((resolve, reject) => {
    const instance = app.listen(0, '127.0.0.1', () => {
      resolve(instance);
    });

    instance.once('error', reject);
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Test server address unavailable');
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) {
    server.closeAllConnections();

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

const loginPayload = JSON.stringify({
  identifier: 'csrf-security-test@example.com',
  password: 'InvalidPasswordForTesting123!',
});

function postLogin(headers: Record<string, string>) {
  return fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: loginPayload,
  });
}

test('CSRF: reject untrusted Origin with HTTP 403', async () => {
  const response = await postLogin({
    Origin: 'https://untrusted.example',
  });

  assert.equal(response.status, 403);

  const body = await response.json() as { code?: string };
  assert.equal(body.code, 'CSRF_ORIGIN_FORBIDDEN');
});

test('CSRF: allow configured frontend Origin through middleware', async () => {
  const response = await postLogin({
    Origin: 'http://localhost:3000',
  });

  // Origin is allowed, but fake login credentials must fail.
  // This test requires the development database to be available.
  assert.equal(response.status, 401);
});

test('CSRF: reject cross-site Fetch Metadata without Origin', async () => {
  const response = await postLogin({
    'Sec-Fetch-Site': 'cross-site',
  });

  assert.equal(response.status, 403);

  const body = await response.json() as { code?: string };
  assert.equal(body.code, 'CSRF_CROSS_SITE_FORBIDDEN');
});

test('CSRF: reject conflicting trusted Origin and cross-site Fetch Metadata', async () => {
  const response = await postLogin({
    Origin: 'http://localhost:3000',
    'Sec-Fetch-Site': 'cross-site',
  });
  assert.equal(response.status, 403);
  const body = await response.json() as { code?: string };
  assert.equal(body.code, 'CSRF_CROSS_SITE_FORBIDDEN');
});
