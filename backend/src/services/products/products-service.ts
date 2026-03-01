import { findProductById, listProductsByCategoryId } from '../../repositories/products-repository';
import { createHttpError } from '../../types/http';
import type {
  GetProductByIdInput,
  GetProductByIdResult,
  ListProductsInput,
  ListProductsResult,
} from './products-service.types';

export async function listProductsService(input: ListProductsInput): Promise<ListProductsResult> {
  return listProductsByCategoryId(input.categoryId);
}

export async function getProductByIdService(
  input: GetProductByIdInput
): Promise<GetProductByIdResult> {
  const product = await findProductById(input.productId);
  if (!product) {
    throw createHttpError('Product not found', 404);
  }

  return product;
}
