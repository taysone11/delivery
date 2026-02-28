import type { NextFunction, Request, Response } from 'express';
import { login, register } from '../services/auth/auth-service';
import type { AuthResult, LoginInput, RegisterInput } from '../services/auth/auth-service.types';

/**
 * HTTP-обработчик регистрации пользователя.
 */
export async function registerHandler(
  req: Request<Record<string, never>, AuthResult, RegisterInput>,
  res: Response<AuthResult>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * HTTP-обработчик входа пользователя.
 */
export async function loginHandler(
  req: Request<Record<string, never>, AuthResult, LoginInput>,
  res: Response<AuthResult>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
