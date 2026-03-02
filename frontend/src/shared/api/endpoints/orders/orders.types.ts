export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'delivering'
  | 'completed'
  | 'canceled';

export type PaymentMethod = 'cash';

export type PaymentStatus = 'pending' | 'paid';

export interface Order {
  id: number;
  userId: number | null;
  cartId: number | null;
  address: string;
  comment: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
  // ISO 8601 date-time string
  placedAt: string;
  // ISO 8601 date-time string
  createdAt: string;
  // ISO 8601 date-time string
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  productName?: string | null;
  quantity: number;
  // ISO 8601 date-time string
  createdAt: string;
}

export interface CreateOrderRequest {
  cartId: number;
  address: string;
  comment?: string;
}

export interface CreateOrderResponse {
  order: Order;
  items: OrderItem[];
}

export interface GetMyOrdersResponse {
  orders: OrderWithItems[];
}

export interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

export interface ErrorResponse {
  error: string;
}
