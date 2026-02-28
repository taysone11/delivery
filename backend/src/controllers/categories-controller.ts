import type { Request, Response } from 'express';

export async function listCategories(req: Request, res: Response): Promise<void> {
  res.status(501).json({ error: 'Not implemented yet' });
}
