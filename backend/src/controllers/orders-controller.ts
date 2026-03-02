import type { NextFunction, Request, Response } from 'express';
import { createOrderService, getMyOrdersService } from '../services/orders/orders-service';
import type { CreateOrderInput, CreateOrderResult, GetMyOrdersResult } from '../services/orders/orders-service.types';
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

export async function getMyOrders(
  req: Request,
  res: Response<GetMyOrdersResult>,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw createHttpError('Unauthorized', 401);
    }

    const result = await getMyOrdersService(req.auth.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
