export type Role = 'client' | 'admin' | 'courier';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  roles: Role[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type RegisterResponse = AuthResponse;
export type LoginResponse = AuthResponse;

export interface ErrorResponse {
  error: string;
}
