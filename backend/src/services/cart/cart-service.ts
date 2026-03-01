import {
  addOrIncrementCartItem,
  getOrCreateCartByUserId,
  isProductExists,
  listCartItems,
  removeCartItemByProductId
} from '../../repositories/cart-repository';
import { createHttpError } from '../../types/http';
import type { AddCartItemInput, CartView } from './cart-service.types';

function assertUserId(userId: number): void {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw createHttpError('Invalid user id', 400);
  }
}

/**
 * Возвращает корзину текущего пользователя.
 * Если корзина отсутствует, создаёт пустую и возвращает её вместе со списком позиций.
 */
export async function getMyCartService(userId: number): Promise<CartView> {
  assertUserId(userId);

  const cart = await getOrCreateCartByUserId(userId);
  const items = await listCartItems(cart.id);

  return { cart, items };
}

/**
 * Добавляет товар в корзину пользователя.
 * Если товар уже присутствует в корзине, увеличивает его количество на переданное значение.
 */
export async function addCartItemService(userId: number, input: AddCartItemInput): Promise<CartView> {
  assertUserId(userId);

  if (!Number.isInteger(input?.productId) || input.productId <= 0) {
    throw createHttpError('productId must be a positive integer', 400);
  }

  const quantity = input.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw createHttpError('quantity must be a positive integer', 400);
  }

  const productExists = await isProductExists(input.productId);
  if (!productExists) {
    throw createHttpError('Product not found', 404);
  }

  const cart = await getOrCreateCartByUserId(userId);
  await addOrIncrementCartItem(cart.id, input.productId, quantity);
  const items = await listCartItems(cart.id);

  return { cart, items };
}

/**
 * Удаляет позицию товара из корзины пользователя по productId.
 * Возвращает обновлённое состояние корзины.
 */
export async function removeCartItemService(userId: number, productId: number): Promise<CartView> {
  assertUserId(userId);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw createHttpError('productId must be a positive integer', 400);
  }

  const cart = await getOrCreateCartByUserId(userId);
  const removed = await removeCartItemByProductId(cart.id, productId);
  if (!removed) {
    throw createHttpError('Cart item not found', 404);
  }

  const items = await listCartItems(cart.id);
  return { cart, items };
}
