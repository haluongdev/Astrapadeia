import { request, expect, type APIRequestContext } from '@playwright/test';
export const API = process.env.SCHOLYX_TEST_API_URL || 'http://localhost:4000';
export type Role = 'STUDENT'|'QTV';
export function credentials(role: Role) {
  return { email: process.env[`SCHOLYX_TEST_${role}_EMAIL`], password: process.env[`SCHOLYX_TEST_${role}_PASSWORD`] };
}
export function hasCredentials(role: Role) { const c=credentials(role); return Boolean(c.email && c.password); }
export async function login(role: Role): Promise<APIRequestContext> {
  const c = credentials(role);
  if (!c.email || !c.password) throw new Error(`Missing SCHOLYX_TEST_${role}_EMAIL/PASSWORD`);
  const ctx = await request.newContext({ baseURL: API, extraHTTPHeaders: {Origin:'http://localhost:3000'} });
  const res = await ctx.post('/api/auth/login', {data: { identifier: c.email, password: c.password }});
  if (res.status() !== 200) {await ctx.dispose(); throw new Error(`${role} login returned HTTP ${res.status()} (expected 200); verify test account and rate limiting`);}
  return ctx;
}
export async function getJson(ctx: APIRequestContext, path:string) {
  const res=await ctx.get(path, {failOnStatusCode:false});
  let body: unknown; try {body=await res.json();} catch {body=null;}
  return {res,body};
}
export function expectArrayPayload(body:unknown) {
  expect(body).toBeTruthy();
  expect(body).toHaveProperty('items');
  expect(Array.isArray((body as {items:unknown}).items)).toBe(true);
}
