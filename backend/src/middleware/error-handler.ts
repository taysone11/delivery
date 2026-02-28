import type { NextFunction, Request, Response } from 'express';
import type { HttpError } from '../types/http';

export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
}
