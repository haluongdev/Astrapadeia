import { test, expect } from '@playwright/test';

test('TC01 - Frontend Scholyx hoat dong', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.locator('body')).toBeVisible();
  await expect(page).not.toHaveTitle('');
});

test('TC02 - Backend Scholyx phan hoi', async ({ request }) => {
  const response = await request.get(
    'http://localhost:4000/api/auth/me'
  );

  // 200 khi co phien dang nhap;
  // 401 khi chua dang nhap la hop le.
  expect([200, 401]).toContain(response.status());
});
