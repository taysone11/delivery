import { http } from '../../http';

import type {
  GetProductByIdParams,
  GetProductByIdResponse,
  ListProductsRequest,
  ListProductsResponse,
} from './products.types';

export async function listProducts(params: ListProductsRequest): Promise<ListProductsResponse> {
  const response = await http.get<ListProductsResponse>('/products', { params });
  return response.data;
}

export async function getProductById(
  params: GetProductByIdParams
): Promise<GetProductByIdResponse> {
  const response = await http.get<GetProductByIdResponse>(`/products/${params.productId}`);
  return response.data;
}

export const productsApi = {
  listProducts,
  getProductById
};
