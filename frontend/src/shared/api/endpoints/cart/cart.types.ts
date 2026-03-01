export interface Cart {
  id: number;
  userId: number;
  // ISO 8601 date-time string
  createdAt: string;
  // ISO 8601 date-time string
  updatedAt: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  // ISO 8601 date-time string
  createdAt: string;
  // ISO 8601 date-time string
  updatedAt: string;
}

export interface CartView {
  cart: Cart;
  items: CartItem[];
}

export interface AddCartItemRequest {
  productId: number;
  quantity?: number;
}

export type AddCartItemResponse = CartView;

export interface DecrementCartItemRequest {
  quantity?: number;
}

export interface DecrementCartItemParams {
  productId: number;
}

export type DecrementCartItemResponse = CartView;

export interface RemoveCartItemParams {
  productId: number;
}

export type RemoveCartItemResponse = CartView;

export type GetMyCartResponse = CartView;

export interface ErrorResponse {
  error: string;
}
