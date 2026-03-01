import { listProductsByCategoryId } from '../../repositories/products-repository';
import type { ListProductsInput, ListProductsResult } from './products-service.types';

export async function listProductsService(input: ListProductsInput): Promise<ListProductsResult> {
  return listProductsByCategoryId(input.categoryId);
}
