import type { PoolClient } from 'pg';
import { getPool } from '../db/pool';
import type { Cart, Order, OrderItem } from '../types/entities';

interface CartRow {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface CartItemWithPriceRow {
  productId: number;
  quantity: number;
  price: string;
}

interface OrderRow {
  id: number;
  userId: number | null;
  cartId: number | null;
  status: Order['status'];
  paymentMethod: Order['paymentMethod'];
  paymentStatus: Order['paymentStatus'];
  total: string;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItemRow {
  id: number;
  orderId: number;
  productId: number | null;
  quantity: number;
  createdAt: string;
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.userId,
    cartId: row.cartId,
    status: row.status,
    paymentMethod: row.paymentMethod,
    paymentStatus: row.paymentStatus,
    total: Number(row.total),
    placedAt: row.placedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findUserCartById(client: PoolClient, cartId: number, userId: number): Promise<Cart | null> {
  const result = await client.query<CartRow>(
    `
      SELECT
        id,
        user_id AS "userId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM cart
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    [cartId, userId]
  );

  return result.rows[0] || null;
}

export async function getCartItemsWithPrice(client: PoolClient, cartId: number): Promise<CartItemWithPriceRow[]> {
  const result = await client.query<CartItemWithPriceRow>(
    `
      SELECT
        ci.product_id AS "productId",
        ci.quantity,
        p.price::text AS "price"
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id ASC
    `,
    [cartId]
  );

  return result.rows;
}

export async function createOrder(
  client: PoolClient,
  data: { userId: number; cartId: number; total: number }
): Promise<Order> {
  const result = await client.query<OrderRow>(
    `
      INSERT INTO orders (user_id, cart_id, total)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        user_id AS "userId",
        cart_id AS "cartId",
        status,
        payment_method AS "paymentMethod",
        payment_status AS "paymentStatus",
        total::text AS "total",
        placed_at AS "placedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [data.userId, data.cartId, data.total]
  );

  return toOrder(result.rows[0]);
}

export async function createOrderItem(
  client: PoolClient,
  data: { orderId: number; productId: number; quantity: number }
): Promise<OrderItem> {
  const result = await client.query<OrderItemRow>(
    `
      INSERT INTO order_items (order_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        order_id AS "orderId",
        product_id AS "productId",
        quantity,
        created_at AS "createdAt"
    `,
    [data.orderId, data.productId, data.quantity]
  );

  return result.rows[0];
}

export async function clearCartItems(client: PoolClient, cartId: number): Promise<void> {
  await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
}
