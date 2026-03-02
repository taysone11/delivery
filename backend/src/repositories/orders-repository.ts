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
  address: string;
  comment: string | null;
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
  productName?: string | null;
  quantity: number;
  createdAt: string;
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.userId,
    cartId: row.cartId,
    address: row.address,
    comment: row.comment,
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
  data: { userId: number; cartId: number; address: string; comment: string | null; total: number }
): Promise<Order> {
  const result = await client.query<OrderRow>(
    `
      INSERT INTO orders (user_id, cart_id, address, comment, total)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id AS "userId",
        cart_id AS "cartId",
        address,
        comment,
        status,
        payment_method AS "paymentMethod",
        payment_status AS "paymentStatus",
        total::text AS "total",
        placed_at AS "placedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [data.userId, data.cartId, data.address, data.comment, data.total]
  );

  return toOrder(result.rows[0]);
}

export async function listOrdersByUserId(userId: number): Promise<Order[]> {
  const pool = getPool();
  const result = await pool.query<OrderRow>(
    `
      SELECT
        id,
        user_id AS "userId",
        cart_id AS "cartId",
        address,
        comment,
        status,
        payment_method AS "paymentMethod",
        payment_status AS "paymentStatus",
        total::text AS "total",
        placed_at AS "placedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC, id DESC
    `,
    [userId]
  );

  return result.rows.map(toOrder);
}

export async function listOrderItemsByOrderIds(orderIds: number[]): Promise<OrderItem[]> {
  if (orderIds.length === 0) {
    return [];
  }

  const pool = getPool();
  const result = await pool.query<OrderItemRow>(
    `
      SELECT
        oi.id,
        oi.order_id AS "orderId",
        oi.product_id AS "productId",
        p.name AS "productName",
        oi.quantity,
        oi.created_at AS "createdAt"
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ANY($1::bigint[])
      ORDER BY oi.order_id DESC, oi.id ASC
    `,
    [orderIds]
  );

  return result.rows;
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
