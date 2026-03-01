import { http } from '../../http';

import type { CreateOrderRequest, CreateOrderResponse } from './orders.types';

export async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  const response = await http.post<CreateOrderResponse>('/orders', payload);
  return response.data;
}

export const ordersApi = {
  createOrder
};
