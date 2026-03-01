import { http } from '../../http';

import type { ListCategoriesResponse } from './categories.types';

export async function listCategories(): Promise<ListCategoriesResponse> {
  const response = await http.get<ListCategoriesResponse>('/categories');
  return response.data;
}

export const categoriesApi = {
  listCategories
};
