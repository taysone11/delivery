import type { RoleCode } from './role';

export interface User {
  id: number;
  email: string;
  phone: string | null;
  fullName: string;
  roles: RoleCode[];
  createdAt: string;
  updatedAt: string;
}
