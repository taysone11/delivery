import type { NextFunction, Request, Response } from 'express';
import { createOrderService } from '../services/orders/orders-service';
import type { CreateOrderInput, CreateOrderResult } from '../services/orders/orders-service.types';
import { createHttpError } from '../types/http';

export async function createOrder(
  req: Request<Record<string, never>, CreateOrderResult, CreateOrderInput>,
  res: Response<CreateOrderResult>,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw createHttpError('Unauthorized', 401);
    }

    const order = await createOrderService(req.auth.userId, req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}
