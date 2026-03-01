import { http } from '../../http';

import type {
  AddCartItemRequest,
  AddCartItemResponse,
  DecrementCartItemParams,
  DecrementCartItemRequest,
  DecrementCartItemResponse,
  GetMyCartResponse,
  RemoveCartItemParams,
  RemoveCartItemResponse
} from './cart.types';

export async function getMyCart(): Promise<GetMyCartResponse> {
  const response = await http.get<GetMyCartResponse>('/cart/me');
  return response.data;
}

export async function addToCart(payload: AddCartItemRequest): Promise<AddCartItemResponse> {
  const response = await http.post<AddCartItemResponse>('/cart/items', payload);
  return response.data;
}

export async function decrementCartItem(
  params: DecrementCartItemParams,
  payload?: DecrementCartItemRequest
): Promise<DecrementCartItemResponse> {
  const response = await http.patch<DecrementCartItemResponse>(
    `/cart/items/${params.productId}/decrement`,
    payload
  );
  return response.data;
}

export async function removeCartItem(params: RemoveCartItemParams): Promise<RemoveCartItemResponse> {
  const response = await http.delete<RemoveCartItemResponse>(`/cart/items/${params.productId}`);
  return response.data;
}

export const cartApi = {
  getMyCart,
  addToCart,
  decrementCartItem,
  removeCartItem
};
