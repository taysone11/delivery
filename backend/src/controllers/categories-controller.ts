import type { NextFunction, Request, Response } from 'express';
import { listCategoriesService } from '../services/categories/categories-service';
import type { ListCategoriesResult } from '../services/categories/categories-service.types';

export async function listCategories(
  req: Request,
  res: Response<ListCategoriesResult>,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await listCategoriesService();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}
