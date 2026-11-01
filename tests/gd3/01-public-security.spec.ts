import { test, expect } from '@playwright/test';
import { API } from './helpers';
test('GD3-001 frontend responds', async ({page}) => {
  await page.goto('http://localhost:3000/');
  await expect(page.locator('body')).toBeVisible();
});
test('GD3-002 backend health 200', async ({request}) => {
  const r=await request.get(`${API}/api/health`); expect(r.status()).toBe(200);
});
const secured = [
  ['/api/auth/me',401],
  ['/api/admin/accounts',401],
  ['/api/admin/audit',401],
  ['/api/admin/management/vip/plans',401],
  ['/api/admin/management/vip/grants',401],
  ['/api/admin/management/vip/report-full',401],
  ['/api/admin/management/vip/demo-transactions',401],
  ['/api/pre/demo-entitlement',401],
  ['/api/pre/demo-transactions',401],
] as const;
for (const [path,code] of secured) {
  test(`GD3 guest ${path} -> ${code}`, async ({request}) => {
    const r=await request.get(`${API}${path}`, {failOnStatusCode:false});
    expect(r.status()).toBe(code);
  });
}
test('GD3-013 unknown API returns 404', async ({request}) => {
  const r=await request.get(`${API}/api/scholyx-gd3-404-test`, {failOnStatusCode:false});
  expect(r.status()).toBe(404);
});
