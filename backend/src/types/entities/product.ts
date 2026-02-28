export interface Product {
  id: number;
  categoryId: number | null;
  name: string;
  description: string | null;
  price: number;
  weightGrams: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
