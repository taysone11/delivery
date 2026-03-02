import type { Order, OrderItem } from '../../types/entities';

export interface CreateOrderInput {
  cartId: number;
  address: string;
  comment?: string;
}

export interface CreateOrderResult {
  order: Order;
  items: OrderItem[];
}
