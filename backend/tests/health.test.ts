import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Milestone 1 - Backend Foundation & Health Tests', () => {
  it('GET /api/health should respond with a valid health check payload', async () => {
    const res = await request(app).get('/api/health');

    // Status can be 200 (healthy) or 503 (degraded if local postgres isn't running)
    assert.ok([200, 503].includes(res.status), `Expected 200 or 503, got ${res.status}`);
    assert.equal(res.headers['content-type']?.includes('application/json'), true);
    assert.ok(res.body.uptimeSeconds >= 0);
    assert.ok(res.body.timestamp);
    assert.ok(['healthy', 'degraded'].includes(res.body.status));
    assert.equal(typeof res.body.database?.connected, 'boolean');
  });

  it('GET /api/health should set security and request ID headers', async () => {
    const res = await request(app).get('/api/health');

    assert.ok(res.headers['x-request-id'], 'Response should include X-Request-Id header');
    assert.ok(res.headers['x-content-type-options'], 'Response should include nosniff header from Helmet');
  });

  it('GET /api/unknown-route should return 404 with standard error JSON', async () => {
    const res = await request(app).get('/api/unknown-endpoint-testing-404');

    assert.equal(res.status, 404);
    assert.equal(res.body.code, 'NOT_FOUND');
    assert.ok(res.body.error);
  });
});
