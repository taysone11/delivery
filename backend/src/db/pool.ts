import { Pool, type PoolConfig } from 'pg';

let pool: Pool | undefined;

export function initPool(config: PoolConfig): Pool {
  if (!pool) {
    pool = new Pool(config);
  }

  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool is not initialized');
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
