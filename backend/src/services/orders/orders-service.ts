import { createHttpError } from '../../types/http';
import type { CreateOrderInput, CreateOrderResult } from './orders-service.types';

export async function createOrderService(userId: number, input: CreateOrderInput): Promise<CreateOrderResult> {
  void userId;
  void input;
  throw createHttpError('Not implemented yet', 501);
}
