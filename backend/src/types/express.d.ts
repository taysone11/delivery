import type { JwtPayloadData, RoleCode } from './auth';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayloadData & { userId: number; roles: RoleCode[] };
    }
  }
}

export {};
