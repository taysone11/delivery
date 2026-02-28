export interface EnvConfig {
  nodeEnv: string;
  port: number;
  db: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max: number;
  };
}

const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as const;

export function getEnv(): EnvConfig {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    db: {
      host: process.env.DB_HOST as string,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME as string,
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      max: Number(process.env.DB_MAX_POOL_SIZE || 10)
    }
  };
}
