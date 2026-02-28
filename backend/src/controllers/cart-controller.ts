import type { NextFunction, Request, Response } from 'express';
import { getMyCartService } from '../services/cart/cart-service';
import type { CartView } from '../services/cart/cart-service.types';
import { createHttpError } from '../types/http';

export async function getMyCart(
  req: Request,
  res: Response<CartView>,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw createHttpError('Unauthorized', 401);
    }

    const cart = await getMyCartService(req.auth.userId);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}
