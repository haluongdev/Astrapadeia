
import 'dotenv/config';
import { z } from 'zod';

const secretSchema = z
  .string()
  .min(32, 'Secret must contain at least 32 characters');

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

    PORT: z.coerce.number().int().min(1).max(65535).default(4000),

    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required'),

    FRONTEND_ORIGIN: z
      .string()
      .url('FRONTEND_ORIGIN must be a valid URL')
      .default('http://localhost:3000'),

    COOKIE_SECRET: secretSchema,
    SESSION_SECRET: secretSchema,
    OTP_SECRET: secretSchema,

    DEMO_MODE: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  })
  .superRefine((config, ctx) => {
    if (config.NODE_ENV !== 'production') {
      return;
    }

    const insecureValues = [
      'scholyx_dev_cookie_secret_key_32chars!',
      'scholyx_dev_session_secret_key_32chars!',
      'scholyx_dev_otp_secret_key_32chars!',
    ];

    const secrets = {
      COOKIE_SECRET: config.COOKIE_SECRET,
      SESSION_SECRET: config.SESSION_SECRET,
      OTP_SECRET: config.OTP_SECRET,
    };

    for (const [name, value] of Object.entries(secrets)) {
      if (insecureValues.includes(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [name],
          message: `${name} must not use a development default in production`,
        });
      }
    }

    if (new Set(Object.values(secrets)).size !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message: 'Production secrets must be different from one another',
      });
    }

    if (!config.FRONTEND_ORIGIN.startsWith('https://')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FRONTEND_ORIGIN'],
        message: 'FRONTEND_ORIGIN must use HTTPS in production',
      });
    }
  });

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables configuration:');

    for (const issue of result.error.issues) {
      console.error(`${issue.path.join('.')}: ${issue.message}`);
    }

    throw new Error('Environment validation failed');
  }

  return result.data;
}

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
