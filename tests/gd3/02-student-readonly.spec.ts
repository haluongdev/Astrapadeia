import { test, expect } from '@playwright/test';
import { hasCredentials, login, getJson, expectArrayPayload } from './helpers';
test.describe('Student - authenticated read-only',()=>{
  test.skip(!hasCredentials('STUDENT'), 'SKIP: Set SCHOLYX_TEST_STUDENT_EMAIL and SCHOLYX_TEST_STUDENT_PASSWORD');
  test('GD3-S01 session, demo entitlement and F5-compatible persistence', async()=>{
    const ctx=await login('STUDENT');
    try {
      const me=await getJson(ctx,'/api/auth/me'); expect(me.res.status()).toBe(200);
      const first=await getJson(ctx,'/api/pre/demo-entitlement');
      expect(first.res.status()).toBe(200);
      expect(first.body).toHaveProperty('active');
      expect(first.body).toHaveProperty('simulation',true);
      const second=await getJson(ctx,'/api/pre/demo-entitlement');
      expect(second.res.status()).toBe(200);
      expect(second.body).toHaveProperty('active',(first.body as any).active);
      expect(second.body).toHaveProperty('expiresAt',(first.body as any).expiresAt);
      // Backend persistence only. UI reload still needs separate browser E2E assertion.
    } finally {await ctx.dispose();}
  });
  test('GD3-S02 student cannot read QTV PRE plans/grants/report', async()=>{
    const ctx=await login('STUDENT');
    try {
      for(const path of ['/api/admin/management/vip/plans','/api/admin/management/vip/grants','/api/admin/management/vip/report-full','/api/admin/management/vip/demo-transactions']){
        const res=await ctx.get(path); expect(res.status(),path).toBe(403);
      }
    } finally{await ctx.dispose();}
  });
  test('GD3-S03 student can read own simulated transactions', async()=>{
    const ctx=await login('STUDENT');
    try {
      const r=await getJson(ctx,'/api/pre/transactions');
      expect(r.res.status()).toBe(200); expectArrayPayload(r.body);
    } finally{await ctx.dispose();}
  });
});
