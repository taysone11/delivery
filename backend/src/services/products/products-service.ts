import type { ListProductsResult } from './products-service.types';
import { createHttpError } from '../../types/http';

export async function listProductsService(): Promise<ListProductsResult> {
  throw createHttpError('Not implemented yet', 501);
}
