import {
  clearCartItems,
  createOrder,
  createOrderItem,
  findUserCartById,
  getCartItemsWithPrice,
  withTransaction
} from '../../repositories/orders-repository';
import type { OrderItem } from '../../types/entities';
import { createHttpError } from '../../types/http';
import type { CreateOrderInput, CreateOrderResult } from './orders-service.types';

/**
 * Создаёт заказ из корзины пользователя:
 * проверяет принадлежность корзины и её заполненность,
 * рассчитывает итоговую сумму, переносит позиции в order_items
 * и очищает корзину после успешного создания заказа.
 */
export async function createOrderService(userId: number, input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw createHttpError('Invalid user id', 400);
  }

  if (!Number.isInteger(input?.cartId) || input.cartId <= 0) {
    throw createHttpError('cartId must be a positive integer', 400);
  }

  return withTransaction(async (client) => {
    const cart = await findUserCartById(client, input.cartId, userId);
    if (!cart) {
      throw createHttpError('Cart not found', 404);
    }

    const cartItems = await getCartItemsWithPrice(client, cart.id);
    if (cartItems.length === 0) {
      throw createHttpError('Cart is empty', 400);
    }

    const totalCents = cartItems.reduce((sum, item) => {
      const priceCents = Math.round(Number(item.price) * 100);
      return sum + priceCents * item.quantity;
    }, 0);
    const total = totalCents / 100;
    const order = await createOrder(client, {
      userId,
      cartId: cart.id,
      total
    });

    const items: OrderItem[] = [];
    for (const cartItem of cartItems) {
      const orderItem = await createOrderItem(client, {
        orderId: order.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity
      });
      items.push(orderItem);
    }

    await clearCartItems(client, cart.id);

    return { order, items };
  });
}
