import { http } from '../../http';

import type { CreateOrderRequest, CreateOrderResponse, GetMyOrdersResponse } from './orders.types';

export async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  const response = await http.post<CreateOrderResponse>('/orders', payload);
  return response.data;
}

export async function getMyOrders(): Promise<GetMyOrdersResponse> {
  const response = await http.get<GetMyOrdersResponse>('/orders/my');
  return response.data;
}

export const ordersApi = {
  createOrder,
  getMyOrders
};
