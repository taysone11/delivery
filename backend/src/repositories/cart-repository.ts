import { getPool } from '../db/pool';
import type { Cart, CartItem } from '../types/entities';

interface CartRow {
  id: number | string;
  userId: number | string;
  createdAt: string;
  updatedAt: string;
}

interface CartItemRow {
  id: number | string;
  cartId: number | string;
  productId: number | string;
  price: number | string;
  quantity: number | string;
  createdAt: string;
  updatedAt: string;
}

interface ProductExistsRow {
  exists: boolean;
}

function toSafeInteger(value: number | string, fieldName: string): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`Invalid ${fieldName} value from database: ${String(value)}`);
  }

  return parsed;
}

function toCart(row: CartRow): Cart {
  return {
    id: toSafeInteger(row.id, 'cart.id'),
    userId: toSafeInteger(row.userId, 'cart.userId'),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function toCartItem(row: CartItemRow): CartItem {
  const price = typeof row.price === 'number' ? row.price : Number(row.price);
  if (!Number.isFinite(price)) {
    throw new Error(`Invalid cart_items.price value from database: ${String(row.price)}`);
  }

  return {
    id: toSafeInteger(row.id, 'cart_items.id'),
    cartId: toSafeInteger(row.cartId, 'cart_items.cartId'),
    productId: toSafeInteger(row.productId, 'cart_items.productId'),
    price,
    quantity: toSafeInteger(row.quantity, 'cart_items.quantity'),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function getOrCreateCartByUserId(userId: number): Promise<Cart> {
  const pool = getPool();
  const result = await pool.query<CartRow>(
    `
      WITH inserted AS (
        INSERT INTO cart (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
        RETURNING
          id,
          user_id AS "userId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      )
      SELECT id, "userId", "createdAt", "updatedAt"
      FROM inserted
      UNION ALL
      SELECT
        c.id,
        c.user_id AS "userId",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt"
      FROM cart c
      WHERE c.user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return toCart(result.rows[0]);
}

export async function listCartItems(cartId: number): Promise<CartItem[]> {
  const pool = getPool();
  const result = await pool.query<CartItemRow>(
    `
      SELECT
        ci.id,
        ci.cart_id AS "cartId",
        ci.product_id AS "productId",
        p.price,
        ci.quantity,
        ci.created_at AS "createdAt",
        ci.updated_at AS "updatedAt"
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at ASC, ci.id ASC
    `,
    [cartId]
  );

  return result.rows.map(toCartItem);
}

export async function isProductExists(productId: number): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query<ProductExistsRow>(
    `
      SELECT EXISTS(
        SELECT 1
        FROM products
        WHERE id = $1
      ) AS "exists"
    `,
    [productId]
  );

  return Boolean(result.rows[0]?.exists);
}

export async function addOrIncrementCartItem(
  cartId: number,
  productId: number,
  quantity: number
): Promise<CartItem> {
  const pool = getPool();
  const result = await pool.query<CartItemRow>(
    `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id) DO UPDATE
      SET quantity = cart_items.quantity + EXCLUDED.quantity,
          updated_at = NOW()
      RETURNING
        id,
        cart_id AS "cartId",
        product_id AS "productId",
        (SELECT price FROM products WHERE id = cart_items.product_id) AS "price",
        quantity,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [cartId, productId, quantity]
  );

  return toCartItem(result.rows[0]);
}

export async function removeCartItemByProductId(cartId: number, productId: number): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(
    `
      DELETE FROM cart_items
      WHERE cart_id = $1 AND product_id = $2
    `,
    [cartId, productId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function decrementCartItemQuantity(
  cartId: number,
  productId: number,
  quantity: number
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query<{ id: number; quantity: number }>(
    `
      WITH updated AS (
        UPDATE cart_items
        SET quantity = quantity - $3,
            updated_at = NOW()
        WHERE cart_id = $1 AND product_id = $2
        RETURNING id, quantity
      ),
      deleted AS (
        DELETE FROM cart_items
        WHERE id IN (
          SELECT id
          FROM updated
          WHERE quantity <= 0
        )
      )
      SELECT id, quantity
      FROM updated
    `,
    [cartId, productId, quantity]
  );

  return result.rows.length > 0;
}
