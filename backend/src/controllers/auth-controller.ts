import type { Request, Response, NextFunction } from 'express';
import { login, register } from '../services/auth-service';

/**
 * HTTP-обработчик регистрации пользователя.
 */
export async function registerHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await register(req.body as { email: string; password: string; fullName: string; phone?: string });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * HTTP-обработчик входа пользователя.
 */
export async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await login(req.body as { email: string; password: string });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
