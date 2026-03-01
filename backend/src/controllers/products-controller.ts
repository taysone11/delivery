import type { NextFunction, Request, Response } from 'express';
import { listProductsService } from '../services/products/products-service';
import type { ListProductsResult } from '../services/products/products-service.types';
import { createHttpError } from '../types/http';

export async function listProducts(
  req: Request,
  res: Response<ListProductsResult>,
  next: NextFunction
): Promise<void> {
  try {
    const rawCategoryId = req.query.categoryId;

    if (typeof rawCategoryId !== 'string' || rawCategoryId.trim() === '') {
      throw createHttpError('categoryId query parameter is required', 400);
    }

    const categoryId = Number(rawCategoryId);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      throw createHttpError('categoryId must be a positive integer', 400);
    }

    const products = await listProductsService({ categoryId });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}
