import "dotenv/config";
import type { PoolClient } from "pg";
import { getEnv } from "../../env";
import { closePool, initPool } from "../../src/db/pool";

interface SeedProduct {
  categoryName: string;
  name: string;
  description: string;
  price: string;
  weightGrams: number;
  imageUrl: string;
}

const PRODUCTS_BY_CATEGORY: Readonly<
  Record<string, ReadonlyArray<Omit<SeedProduct, "categoryName">>>
> = {
  Сеты: [
    {
      name: "Сет Филадельфия",
      description: "Набор популярных роллов с лососем и сливочным сыром.",
      price: "1290.00",
      weightGrams: 620,
      imageUrl: "/images/products/sets/set-philadelphia.jpeg",
    },
    {
      name: "Сет Классический",
      description: "Классический набор роллов для двоих.",
      price: "1190.00",
      weightGrams: 590,
      imageUrl: "/images/products/sets/set-classic.png",
    },
    {
      name: "Сет Запеченный",
      description: "Ассорти из запеченных роллов с соусом.",
      price: "1390.00",
      weightGrams: 680,
      imageUrl: "/images/products/sets/set-baked.webp",
    },
  ],
  Роллы: [
    {
      name: "Филадельфия классик",
      description: "Ролл с лососем и сливочным сыром.",
      price: "590.00",
      weightGrams: 260,
      imageUrl: "/images/products/rolls/roll-philadelphia-classic.jpeg",
    },
    {
      name: "Калифорния с крабом",
      description: "Ролл с крабом, авокадо и икрой тобико.",
      price: "490.00",
      weightGrams: 240,
      imageUrl: "/images/products/rolls/roll-california-crab.jpg",
    },
    {
      name: "Дракон",
      description: "Ролл с угрем, авокадо и соусом унаги.",
      price: "640.00",
      weightGrams: 280,
      imageUrl: "/images/products/rolls/roll-dragon.jpg",
    },
    {
      name: "Аляска",
      description: "Ролл с лососем, огурцом и сыром.",
      price: "520.00",
      weightGrams: 245,
      imageUrl: "/images/products/rolls/roll-alaska.png",
    },
  ],
  Суши: [
    {
      name: "Нигири лосось",
      description: "Две суши с охлажденным лососем.",
      price: "260.00",
      weightGrams: 90,
      imageUrl: "/images/products/sushi/sushi-nigiri-salmon.jpeg",
    },
    {
      name: "Нигири тунец",
      description: "Две суши с тунцом.",
      price: "290.00",
      weightGrams: 90,
      imageUrl: "/images/products/sushi/sushi-nigiri-tuna.jpg",
    },
    {
      name: "Нигири угорь",
      description: "Две суши с угрем и соусом унаги.",
      price: "310.00",
      weightGrams: 95,
      imageUrl: "/images/products/sushi/sushi-nigiri-eel.jpg",
    },
  ],
  Напитки: [
    {
      name: "Зеленый чай 0.5л",
      description: "Холодный зеленый чай без сахара.",
      price: "150.00",
      weightGrams: 500,
      imageUrl: "/images/products/drinks/drink-green-tea-05.webp",
    },
    {
      name: "Черный чай 0.5л",
      description: "Классический холодный черный чай.",
      price: "150.00",
      weightGrams: 500,
      imageUrl: "/images/products/drinks/drink-black-tea-05.jpg",
    },
    {
      name: "Лимонад юдзу 0.5л",
      description: "Освежающий лимонад с цитрусом юдзу.",
      price: "190.00",
      weightGrams: 500,
      imageUrl: "/images/products/drinks/drink-yuzu-lemonade-05.webp",
    },
  ],
};

async function upsertCategory(
  client: PoolClient,
  name: string,
): Promise<number> {
  const result = await client.query<{ id: number }>(
    `
      INSERT INTO categories (name)
      VALUES ($1)
      ON CONFLICT (name) DO UPDATE
      SET updated_at = NOW()
      RETURNING id
    `,
    [name],
  );

  return result.rows[0].id;
}

async function upsertProduct(
  client: PoolClient,
  seed: SeedProduct,
  categoryId: number,
): Promise<number> {
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
    [
      seed.name,
      categoryId,
      seed.description,
      seed.price,
      seed.weightGrams,
      seed.imageUrl,
    ],
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
    [
      categoryId,
      seed.name,
      seed.description,
      seed.price,
      seed.weightGrams,
      seed.imageUrl,
    ],
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
    max: env.db.max,
  });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const summary: Array<{ category: string; count: number }> = [];

    for (const [categoryName, categoryProducts] of Object.entries(
      PRODUCTS_BY_CATEGORY,
    )) {
      const categoryId = await upsertCategory(client, categoryName);
      let createdOrUpdated = 0;

      for (const product of categoryProducts) {
        await upsertProduct(client, { ...product, categoryName }, categoryId);
        createdOrUpdated += 1;
      }

      summary.push({ category: categoryName, count: createdOrUpdated });
    }

    await client.query("COMMIT");

    console.log("Products seed completed successfully.");
    for (const row of summary) {
      console.log(`  ${row.category}: ${row.count} products`);
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await closePool();
  }
}

main().catch((error) => {
  console.error("Products seed failed:", error);
  process.exitCode = 1;
});
