import { test, expect } from '@playwright/test';
import { hasCredentials, login, getJson, expectArrayPayload } from './helpers';
test.describe('QTV PRE / SYS - authenticated read-only',()=>{
  test.skip(!hasCredentials('QTV'), 'SKIP: Set SCHOLYX_TEST_QTV_EMAIL and SCHOLYX_TEST_QTV_PASSWORD');
  const listEndpoints = [
    '/api/admin/management/vip/plans',
    '/api/admin/management/vip/transactions',
    '/api/admin/management/vip/transactions-detailed',
    '/api/admin/management/vip/grants',
    '/api/admin/management/vip/demo-transactions',
  ];
  for(const path of listEndpoints) {
    test(`GD3-QTV list ${path} -> 200`, async()=>{
      const ctx=await login('QTV');
      try {const r=await getJson(ctx,path); expect(r.res.status(),JSON.stringify(r.body)).toBe(200); expectArrayPayload(r.body);}
      finally {await ctx.dispose();}
    });
  }
  for(const path of ['/api/admin/management/vip/report','/api/admin/management/vip/report-full','/api/admin/management/vip/reconciliation','/api/admin/sys/overview','/api/admin/sys/audit']) {
    test(`GD3-QTV read ${path} -> 200`, async()=>{
      const ctx=await login('QTV');
      try {const r=await getJson(ctx,path); expect(r.res.status(),JSON.stringify(r.body)).toBe(200); expect(r.body).toBeTruthy();}
      finally {await ctx.dispose();}
    });
  }
  test('GD3-QTV simulated records are explicitly marked',async()=>{
    const ctx=await login('QTV');
    try {
      const {res,body}=await getJson(ctx,'/api/admin/management/vip/demo-transactions');
      expect(res.status()).toBe(200); expectArrayPayload(body);
      expect(body).toHaveProperty('simulation',true);
      for(const t of (body as any).items) expect(['pending','simulated']).toContain(t.status);
      // Does NOT claim revenue correctness without DB baseline comparison.
    }finally{await ctx.dispose();}
  });
});
