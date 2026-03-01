export interface Category {
  id: number;
  name: string;
  // ISO 8601 date-time string
  createdAt: string;
  // ISO 8601 date-time string
  updatedAt: string;
}

export type ListCategoriesResponse = Category[];

export interface ErrorResponse {
  error: string;
}
