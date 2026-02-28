import type { Cart, CartItem } from '../../types/entities';

export interface CartView {
  cart: Cart;
  items: CartItem[];
}
