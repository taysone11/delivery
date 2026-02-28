import type { NextFunction, Request, Response } from 'express';
import { getPool } from '../db/pool';

export async function getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');

    res.json({
      status: 'ok',
      service: 'sushi-delivery-backend',
      database: 'up',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}
