import type { NextFunction, Request, Response } from 'express';
import { addCartItemService, decrementCartItemService, getMyCartService, removeCartItemService } from '../services/cart/cart-service';
import type { AddCartItemInput, CartView, DecrementCartItemInput } from '../services/cart/cart-service.types';
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

export async function addCartItem(
  req: Request<Record<string, never>, CartView, AddCartItemInput>,
  res: Response<CartView>,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw createHttpError('Unauthorized', 401);
    }

    const cart = await addCartItemService(req.auth.userId, req.body);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(
  req: Request<{ productId: string }, CartView>,
  res: Response<CartView>,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw createHttpError('Unauthorized', 401);
    }

    const productId = Number(req.params.productId);
    const cart = await removeCartItemService(req.auth.userId, productId);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}

export async function decrementCartItem(
  req: Request<{ productId: string }, CartView, DecrementCartItemInput>,
  res: Response<CartView>,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      throw createHttpError('Unauthorized', 401);
    }

    const productId = Number(req.params.productId);
    const cart = await decrementCartItemService(req.auth.userId, productId, req.body);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}
