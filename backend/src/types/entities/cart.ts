export interface Cart {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}
