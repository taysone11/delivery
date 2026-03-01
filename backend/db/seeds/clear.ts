import 'dotenv/config';
import { getEnv } from '../../env';
import { initPool, closePool } from '../../src/db/pool';

async function main(): Promise<void> {
  const env = getEnv();
  const pool = initPool({
    host: env.db.host,
    port: env.db.port,
    database: env.db.database,
    user: env.db.user,
    password: env.db.password,
    max: env.db.max
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`
      TRUNCATE TABLE
        order_items,
        orders,
        cart_items,
        cart,
        user_roles,
        products,
        categories,
        users,
        roles
      RESTART IDENTITY CASCADE
    `);
    await client.query('COMMIT');
    console.log('Database data cleared successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await closePool();
  }
}

main().catch((error) => {
  console.error('Clear failed:', error);
  process.exitCode = 1;
});
