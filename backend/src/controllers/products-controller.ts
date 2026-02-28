import type { Request, Response } from 'express';

export async function listProducts(req: Request, res: Response): Promise<void> {
  res.status(501).json({ error: 'Not implemented yet' });
}
