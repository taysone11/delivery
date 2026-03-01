import { getPool } from '../db/pool';
import type { Category } from '../types/entities';

interface CategoryRow {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function listCategories(): Promise<Category[]> {
  const pool = getPool();
  const result = await pool.query<CategoryRow>(`
    SELECT
      id,
      name,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM categories
    ORDER BY name ASC
  `);

  return result.rows;
}
