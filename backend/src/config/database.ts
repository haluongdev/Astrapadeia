import pg from 'pg';
import { env } from './env.js';
import { DatabaseHealthResult } from '../types/index.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected idle client error on PostgreSQL pool:', err);
});

if (env.NODE_ENV !== 'test') {
  pool.on('connect', () => {
    // Optional debug log in development
  });
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const start = Date.now();
  try {
    const result = await pool.query('SELECT 1 AS ok, NOW() AS now');
    const latencyMs = Date.now() - start;
    return {
      connected: result.rows[0]?.ok === 1,
      timestamp: result.rows[0]?.now ? new Date(result.rows[0].now).toISOString() : new Date().toISOString(),
      latencyMs,
    };
  } catch (error: any) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: error?.message || 'Database connection error',
    };
  }
}

export async function closeDatabasePool(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ PostgreSQL connection pool closed successfully.');
  } catch (err) {
    console.error('❌ Error closing PostgreSQL pool:', err);
  }
}
