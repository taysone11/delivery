export type RoleCode = 'client' | 'admin' | 'courier';

export interface JwtPayloadData {
  sub: string;
  email: string;
  roles: RoleCode[];
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  roles: RoleCode[];
}
