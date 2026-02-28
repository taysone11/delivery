import 'dotenv/config';
import { createApp } from './app';
import { getEnv } from './config/env';
import { closePool, initPool } from './db/pool';

async function bootstrap(): Promise<void> {
  const env = getEnv();
  initPool(env.db);

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`Server started on port ${env.port}`);
  });

  const shutdown = (): void => {
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
