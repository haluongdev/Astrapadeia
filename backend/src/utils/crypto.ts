import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hmacSha256(value: string, secret: string = env.OTP_SECRET): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function generateRandomToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function generateNumericOtp(digits: number = 6): string {
  const max = Math.pow(10, digits);
  const num = randomBytes(4).readUInt32BE() % max;
  return String(num).padStart(digits, '0');
}
