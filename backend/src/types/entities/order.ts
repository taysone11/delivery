export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'canceled';
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
  placedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  productName?: string | null;
  quantity: number;
  createdAt: string;
}
