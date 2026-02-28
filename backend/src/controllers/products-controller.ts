import type { NextFunction, Request, Response } from 'express';
import { listProductsService } from '../services/products/products-service';
import type { ListProductsResult } from '../services/products/products-service.types';

export async function listProducts(
  req: Request,
  res: Response<ListProductsResult>,
  next: NextFunction
): Promise<void> {
  try {
    const products = await listProductsService();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}
