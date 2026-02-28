import { createHttpError } from '../../types/http';
import type { CartView } from './cart-service.types';

export async function getMyCartService(userId: number): Promise<CartView> {
  void userId;
  throw createHttpError('Not implemented yet', 501);
}
