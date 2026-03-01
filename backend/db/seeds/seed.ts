import 'dotenv/config';
import type { PoolClient } from 'pg';
import { getEnv } from '../../env';
import { initPool, closePool } from '../../src/db/pool';
import { hashPassword } from '../../src/utils/password';
import type { RoleCode } from '../../src/types/auth';

interface SeedUser {
  email: string;
  fullName: string;
  phone: string | null;
  password: string;
  roles: RoleCode[];
}

interface SeedProduct {
  categoryName: string;
  name: string;
  description: string;
  price: string;
  weightGrams: number;
  imageUrl: string;
}

const ROLE_SEEDS: ReadonlyArray<{ code: RoleCode; name: string }> = [
  { code: 'client', name: 'Клиент' },
  { code: 'admin', name: 'Администратор' },
  { code: 'courier', name: 'Курьер' }
];

const USER_SEEDS: ReadonlyArray<SeedUser> = [
  {
    email: 'admin@sushi.local',
    fullName: 'Администратор',
    phone: '+10000000001',
    password: 'admin123',
    roles: ['admin', 'client']
  },
  {
    email: 'client@sushi.local',
    fullName: 'Тестовый Клиент',
    phone: '+10000000002',
    password: 'client123',
    roles: ['client']
  },
  {
    email: 'courier@sushi.local',
    fullName: 'Тестовый Курьер',
    phone: '+10000000003',
    password: 'courier123',
    roles: ['courier']
  }
];

const CATEGORY_SEEDS = ['Сеты', 'Роллы', 'Суши', 'Напитки'] as const;

const PRODUCT_SEEDS: ReadonlyArray<SeedProduct> = [
  {
    categoryName: 'Сеты',
    name: 'Сет Филадельфия',
    description: '8 классических роллов с лососем и сливочным сыром.',
    price: '1290.00',
    weightGrams: 520,
    imageUrl: 'https://images.example.com/set-philadelphia.jpg'
  },
  {
    categoryName: 'Роллы',
    name: 'Калифорния с крабом',
    description: 'Ролл с крабовым мясом, авокадо и икрой тобико.',
    price: '490.00',
    weightGrams: 240,
    imageUrl: 'https://images.example.com/california-crab.jpg'
  },
  {
    categoryName: 'Суши',
    name: 'Нигири с лососем',
    description: 'Пара классических нигири с охлажденным лососем.',
    price: '260.00',
    weightGrams: 90,
    imageUrl: 'https://images.example.com/salmon-nigiri.jpg'
  },
  {
    categoryName: 'Напитки',
    name: 'Зеленый чай',
    description: 'Бутылка зеленого чая без сахара, 0.5 л.',
    price: '150.00',
    weightGrams: 500,
    imageUrl: 'https://images.example.com/green-tea.jpg'
  }
];

async function upsertRole(client: PoolClient, code: RoleCode, name: string): Promise<number> {
  const result = await client.query<{ id: number }>(
    `
      INSERT INTO roles (code, name)
      VALUES ($1, $2)
      ON CONFLICT (code) DO UPDATE
      SET name = EXCLUDED.name
      RETURNING id
    `,
    [code, name]
  );

  return result.rows[0].id;
}

async function upsertUser(client: PoolClient, user: SeedUser): Promise<number> {
  const passwordHash = await hashPassword(user.password);

  const result = await client.query<{ id: number }>(
    `
      INSERT INTO users (email, phone, password_hash, full_name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE
      SET phone = EXCLUDED.phone,
          password_hash = EXCLUDED.password_hash,
          full_name = EXCLUDED.full_name,
          updated_at = NOW()
      RETURNING id
    `,
    [user.email.toLowerCase(), user.phone, passwordHash, user.fullName]
  );

  return result.rows[0].id;
}

async function assignUserRole(client: PoolClient, userId: number, roleId: number): Promise<void> {
  await client.query(
    `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, role_id) DO NOTHING
    `,
    [userId, roleId]
  );
}

async function upsertCategory(client: PoolClient, name: string): Promise<number> {
  const result = await client.query<{ id: number }>(
    `
      INSERT INTO categories (name)
      VALUES ($1)
      ON CONFLICT (name) DO UPDATE
      SET updated_at = NOW()
      RETURNING id
    `,
    [name]
  );

  return result.rows[0].id;
}

async function upsertProduct(client: PoolClient, seed: SeedProduct, categoryId: number): Promise<number> {
  const updated = await client.query<{ id: number }>(
    `
      UPDATE products
      SET category_id = $2,
          description = $3,
          price = $4,
          weight_grams = $5,
          image_url = $6,
          updated_at = NOW()
      WHERE name = $1
      RETURNING id
    `,
    [seed.name, categoryId, seed.description, seed.price, seed.weightGrams, seed.imageUrl]
  );

  if (updated.rows[0]) {
    return updated.rows[0].id;
  }

  const inserted = await client.query<{ id: number }>(
    `
      INSERT INTO products (category_id, name, description, price, weight_grams, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [categoryId, seed.name, seed.description, seed.price, seed.weightGrams, seed.imageUrl]
  );

  return inserted.rows[0].id;
}

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

    const roleIds = new Map<RoleCode, number>();
    for (const role of ROLE_SEEDS) {
      roleIds.set(role.code, await upsertRole(client, role.code, role.name));
    }

    for (const user of USER_SEEDS) {
      const userId = await upsertUser(client, user);
      for (const roleCode of user.roles) {
        const roleId = roleIds.get(roleCode);
        if (!roleId) {
          throw new Error(`Role "${roleCode}" not found while seeding`);
        }
        await assignUserRole(client, userId, roleId);
      }
    }

    const categoryIds = new Map<string, number>();
    for (const categoryName of CATEGORY_SEEDS) {
      categoryIds.set(categoryName, await upsertCategory(client, categoryName));
    }

    for (const product of PRODUCT_SEEDS) {
      const categoryId = categoryIds.get(product.categoryName);
      if (!categoryId) {
        throw new Error(`Category "${product.categoryName}" not found while seeding products`);
      }
      await upsertProduct(client, product, categoryId);
    }

    await client.query('COMMIT');

    console.log('Seed completed successfully.');
    console.log('Created/updated users:');
    console.log('  admin@sushi.local / admin123');
    console.log('  client@sushi.local / client123');
    console.log('  courier@sushi.local / courier123');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await closePool();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
