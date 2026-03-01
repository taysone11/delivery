import type { Product } from '../../types/entities';

export interface ListProductsInput {
  categoryId: number;
}

export type ListProductsResult = Product[];
