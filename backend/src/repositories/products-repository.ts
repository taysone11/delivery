import { getPool } from '../db/pool';
import type { Product } from '../types/entities';

interface ProductRow {
  id: number;
  categoryId: number | null;
  name: string;
  description: string | null;
  price: number;
  weightGrams: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listProductsByCategoryId(categoryId: number): Promise<Product[]> {
  const pool = getPool();
  const result = await pool.query<ProductRow>(
    `
      SELECT
        id,
        category_id AS "categoryId",
        name,
        description,
        price,
        weight_grams AS "weightGrams",
        image_url AS "imageUrl",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM products
      WHERE category_id = $1
      ORDER BY name ASC
    `,
    [categoryId]
  );

  return result.rows;
}
