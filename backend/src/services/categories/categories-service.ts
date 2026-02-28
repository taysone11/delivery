import type { ListCategoriesResult } from './categories-service.types';
import { createHttpError } from '../../types/http';

export async function listCategoriesService(): Promise<ListCategoriesResult> {
  throw createHttpError('Not implemented yet', 501);
}
