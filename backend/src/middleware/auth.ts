import type { NextFunction, Request, Response } from 'express';
import type { JwtPayloadData, RoleCode } from '../types/auth';
import { verifyJwt } from '../utils/jwt';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  return secret;
}

function toHttpError(message: string, statusCode: number): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

/**
 * Проверяет Bearer-токен и добавляет декодированный auth-пayload в request.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(toHttpError('Unauthorized', 401));
    return;
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = verifyJwt(token, getJwtSecret());
    req.auth = {
      sub: decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
      userId: Number(decoded.sub)
    };
    next();
  } catch (error) {
    next(toHttpError('Unauthorized', 401));
  }
}

/**
 * Проверяет, что у текущего аутентифицированного пользователя есть хотя бы одна из разрешённых ролей.
 */
export function requireRoles(allowed: RoleCode[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(toHttpError('Unauthorized', 401));
      return;
    }

    const hasRole = req.auth.roles.some((role) => allowed.includes(role));
    if (!hasRole) {
      next(toHttpError('Forbidden', 403));
      return;
    }

    next();
  };
}
