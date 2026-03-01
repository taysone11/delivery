import { http } from '../../http';

import type { ListProductsRequest, ListProductsResponse } from './products.types';

export async function listProducts(params: ListProductsRequest): Promise<ListProductsResponse> {
  const response = await http.get<ListProductsResponse>('/products', { params });
  return response.data;
}

export const productsApi = {
  listProducts
};
