import type { ListCategoriesResult } from './categories-service.types';
import { listCategories } from '../../repositories/categories-repository';

export async function listCategoriesService(): Promise<ListCategoriesResult> {
  return listCategories();
}
