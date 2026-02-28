import type { Order, OrderItem } from '../../types/entities';

export interface CreateOrderInput {
  cartId: number;
}

export interface CreateOrderResult {
  order: Order;
  items: OrderItem[];
}
