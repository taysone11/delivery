import 'dotenv/config';
import type { PoolClient } from 'pg';
import { getEnv } from '../../env';
import { closePool, initPool } from '../../src/db/pool';

interface SeedProduct {
  categoryName: string;
  name: string;
  description: string;
  price: string;
  weightGrams: number;
  imageUrl: string;
}

const PRODUCTS_BY_CATEGORY: Readonly<Record<string, ReadonlyArray<Omit<SeedProduct, 'categoryName'>>>> = {
  Сеты: [
    { name: 'Сет Филадельфия', description: 'Набор популярных роллов с лососем и сливочным сыром.', price: '1290.00', weightGrams: 620, imageUrl: 'https://images.example.com/sets/set-philadelphia.jpg' },
    { name: 'Сет Классический', description: 'Классический набор роллов для двоих.', price: '1190.00', weightGrams: 590, imageUrl: 'https://images.example.com/sets/set-classic.jpg' },
    { name: 'Сет Запеченный', description: 'Ассорти из запеченных роллов с соусом.', price: '1390.00', weightGrams: 680, imageUrl: 'https://images.example.com/sets/set-baked.jpg' },
    { name: 'Сет Премиум', description: 'Большой набор роллов с лососем, тунцом и угрем.', price: '1890.00', weightGrams: 840, imageUrl: 'https://images.example.com/sets/set-premium.jpg' },
    { name: 'Сет Для компании', description: 'Сет из 40 кусочков для большой компании.', price: '2290.00', weightGrams: 1100, imageUrl: 'https://images.example.com/sets/set-company.jpg' },
    { name: 'Сет Темпура', description: 'Горячий сет роллов в темпуре.', price: '1490.00', weightGrams: 720, imageUrl: 'https://images.example.com/sets/set-tempura.jpg' },
    { name: 'Сет Острый', description: 'Набор острых роллов с пикантными соусами.', price: '1340.00', weightGrams: 640, imageUrl: 'https://images.example.com/sets/set-spicy.jpg' },
    { name: 'Сет Морской', description: 'Сет роллов с морепродуктами и икрой.', price: '1790.00', weightGrams: 790, imageUrl: 'https://images.example.com/sets/set-sea.jpg' },
    { name: 'Сет Мини', description: 'Компактный набор роллов для одного.', price: '890.00', weightGrams: 420, imageUrl: 'https://images.example.com/sets/set-mini.jpg' },
    { name: 'Сет Хит', description: 'Хиты меню в одном наборе.', price: '1590.00', weightGrams: 760, imageUrl: 'https://images.example.com/sets/set-hit.jpg' }
  ],
  Роллы: [
    { name: 'Филадельфия классик', description: 'Ролл с лососем и сливочным сыром.', price: '590.00', weightGrams: 260, imageUrl: 'https://images.example.com/rolls/philadelphia-classic.jpg' },
    { name: 'Калифорния с крабом', description: 'Ролл с крабом, авокадо и икрой тобико.', price: '490.00', weightGrams: 240, imageUrl: 'https://images.example.com/rolls/california-crab.jpg' },
    { name: 'Дракон', description: 'Ролл с угрем, авокадо и соусом унаги.', price: '640.00', weightGrams: 280, imageUrl: 'https://images.example.com/rolls/dragon.jpg' },
    { name: 'Аляска', description: 'Ролл с лососем, огурцом и сыром.', price: '520.00', weightGrams: 245, imageUrl: 'https://images.example.com/rolls/alaska.jpg' },
    { name: 'Канада', description: 'Ролл с угрем, лососем и мягким сыром.', price: '610.00', weightGrams: 270, imageUrl: 'https://images.example.com/rolls/canada.jpg' },
    { name: 'Темпура с креветкой', description: 'Горячий ролл с креветкой в темпуре.', price: '560.00', weightGrams: 255, imageUrl: 'https://images.example.com/rolls/tempura-shrimp.jpg' },
    { name: 'Острый тунец', description: 'Ролл с тунцом и острым соусом.', price: '540.00', weightGrams: 235, imageUrl: 'https://images.example.com/rolls/spicy-tuna.jpg' },
    { name: 'Чиз ролл', description: 'Ролл с сыром, лососем и огурцом.', price: '500.00', weightGrams: 250, imageUrl: 'https://images.example.com/rolls/cheese-roll.jpg' },
    { name: 'Унаги маки', description: 'Маки с угрем и кунжутом.', price: '470.00', weightGrams: 210, imageUrl: 'https://images.example.com/rolls/unagi-maki.jpg' },
    { name: 'Сяке маки', description: 'Классические маки с лососем.', price: '390.00', weightGrams: 190, imageUrl: 'https://images.example.com/rolls/sake-maki.jpg' }
  ],
  Суши: [
    { name: 'Нигири лосось', description: 'Две суши с охлажденным лососем.', price: '260.00', weightGrams: 90, imageUrl: 'https://images.example.com/sushi/nigiri-salmon.jpg' },
    { name: 'Нигири тунец', description: 'Две суши с тунцом.', price: '290.00', weightGrams: 90, imageUrl: 'https://images.example.com/sushi/nigiri-tuna.jpg' },
    { name: 'Нигири угорь', description: 'Две суши с угрем и соусом унаги.', price: '310.00', weightGrams: 95, imageUrl: 'https://images.example.com/sushi/nigiri-eel.jpg' },
    { name: 'Гункан лосось', description: 'Суши-кораблик с лососем.', price: '190.00', weightGrams: 60, imageUrl: 'https://images.example.com/sushi/gunkan-salmon.jpg' },
    { name: 'Гункан тунец', description: 'Суши-кораблик с тунцом.', price: '210.00', weightGrams: 60, imageUrl: 'https://images.example.com/sushi/gunkan-tuna.jpg' },
    { name: 'Гункан креветка', description: 'Суши-кораблик с креветкой.', price: '200.00', weightGrams: 60, imageUrl: 'https://images.example.com/sushi/gunkan-shrimp.jpg' },
    { name: 'Суши с креветкой', description: 'Пара суши с креветкой.', price: '240.00', weightGrams: 90, imageUrl: 'https://images.example.com/sushi/nigiri-shrimp.jpg' },
    { name: 'Суши с осьминогом', description: 'Пара суши с осьминогом.', price: '270.00', weightGrams: 90, imageUrl: 'https://images.example.com/sushi/nigiri-octopus.jpg' },
    { name: 'Инаари с лососем', description: 'Инаари с рисом и лососем.', price: '230.00', weightGrams: 100, imageUrl: 'https://images.example.com/sushi/inari-salmon.jpg' },
    { name: 'Инаари с тунцом', description: 'Инаари с рисом и тунцом.', price: '240.00', weightGrams: 100, imageUrl: 'https://images.example.com/sushi/inari-tuna.jpg' }
  ],
  Напитки: [
    { name: 'Зеленый чай 0.5л', description: 'Холодный зеленый чай без сахара.', price: '150.00', weightGrams: 500, imageUrl: 'https://images.example.com/drinks/green-tea-05.jpg' },
    { name: 'Черный чай 0.5л', description: 'Классический холодный черный чай.', price: '150.00', weightGrams: 500, imageUrl: 'https://images.example.com/drinks/black-tea-05.jpg' },
    { name: 'Лимонад юдзу 0.5л', description: 'Освежающий лимонад с цитрусом юдзу.', price: '190.00', weightGrams: 500, imageUrl: 'https://images.example.com/drinks/yuzu-lemonade-05.jpg' },
    { name: 'Кола 0.5л', description: 'Газированный напиток, 0.5 литра.', price: '170.00', weightGrams: 500, imageUrl: 'https://images.example.com/drinks/cola-05.jpg' },
    { name: 'Минеральная вода 0.5л', description: 'Негазированная минеральная вода.', price: '120.00', weightGrams: 500, imageUrl: 'https://images.example.com/drinks/water-05.jpg' },
    { name: 'Апельсиновый сок 0.3л', description: 'Сок апельсиновый, 0.3 литра.', price: '180.00', weightGrams: 300, imageUrl: 'https://images.example.com/drinks/orange-juice-03.jpg' },
    { name: 'Яблочный сок 0.3л', description: 'Сок яблочный, 0.3 литра.', price: '180.00', weightGrams: 300, imageUrl: 'https://images.example.com/drinks/apple-juice-03.jpg' },
    { name: 'Морс клюквенный 0.5л', description: 'Домашний клюквенный морс.', price: '200.00', weightGrams: 500, imageUrl: 'https://images.example.com/drinks/cranberry-mors-05.jpg' },
    { name: 'Имбирный эль 0.33л', description: 'Пряный газированный напиток.', price: '210.00', weightGrams: 330, imageUrl: 'https://images.example.com/drinks/ginger-ale-033.jpg' },
    { name: 'Тоник 0.33л', description: 'Классический тоник.', price: '190.00', weightGrams: 330, imageUrl: 'https://images.example.com/drinks/tonic-033.jpg' }
  ]
};

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

    const summary: Array<{ category: string; count: number }> = [];

    for (const [categoryName, categoryProducts] of Object.entries(PRODUCTS_BY_CATEGORY)) {
      const categoryId = await upsertCategory(client, categoryName);
      let createdOrUpdated = 0;

      for (const product of categoryProducts) {
        await upsertProduct(client, { ...product, categoryName }, categoryId);
        createdOrUpdated += 1;
      }

      summary.push({ category: categoryName, count: createdOrUpdated });
    }

    await client.query('COMMIT');

    console.log('Products seed completed successfully.');
    for (const row of summary) {
      console.log(`  ${row.category}: ${row.count} products`);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await closePool();
  }
}

main().catch((error) => {
  console.error('Products seed failed:', error);
  process.exitCode = 1;
});
