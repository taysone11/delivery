export interface Product {
  id: number;
  categoryId: number | null;
  name: string;
  description: string | null;
  price: number;
  weightGrams: number | null;
  imageUrl: string | null;
  // ISO 8601 date-time string
  createdAt: string;
  // ISO 8601 date-time string
  updatedAt: string;
}

export interface ListProductsRequest {
  categoryId: number;
}

export type ListProductsResponse = Product[];

export interface ErrorResponse {
  error: string;
}
