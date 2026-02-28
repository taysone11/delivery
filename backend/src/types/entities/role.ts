export type RoleCode = 'client' | 'admin' | 'courier';

export interface Role {
  id: number;
  code: RoleCode;
  name: string;
  createdAt: string;
}
