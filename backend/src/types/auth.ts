import type { RoleCode } from './entities';
export type { RoleCode };

export interface JwtPayloadData {
  sub: string;
  email: string;
  roles: RoleCode[];
}
