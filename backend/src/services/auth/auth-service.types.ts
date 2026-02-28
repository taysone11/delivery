import type { User } from '../../types/entities';

export type AuthUser = Pick<User, 'id' | 'email' | 'fullName' | 'phone' | 'roles'>;

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}
