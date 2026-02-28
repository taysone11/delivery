import {
  assignRole,
  createUser,
  ensureRole,
  findUserByEmail,
  getUserRoles,
  withTransaction
} from '../../repositories/auth-repository';
import type { JwtPayloadData } from '../../types/auth';
import { createHttpError } from '../../types/http';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signJwt } from '../../utils/jwt';
import type { AuthResult, AuthUser, LoginInput, RegisterInput } from './auth-service.types';

/**
 * Возвращает секрет, необходимый для подписи и проверки access-токенов.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return secret;
}

function signToken(payload: JwtPayloadData): string {
  return signJwt(payload, getJwtSecret(), process.env.JWT_EXPIRES_IN || '7d');
}

function toAuthUser(user: { id: number; email: string; fullName: string; phone: string | null }, roles: AuthUser['roles']): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    roles
  };
}

function makeAuthResult(user: AuthUser): AuthResult {
  const token = signToken({
    sub: String(user.id),
    email: user.email,
    roles: user.roles
  });

  return { token, user };
}

/**
 * Регистрирует нового пользователя, назначает роль `client` по умолчанию
 * и возвращает auth-ответ с access-токеном.
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const phone = input.phone?.trim() || null;

  if (!email || !fullName || !input.password) {
    throw createHttpError('email, password and fullName are required', 400);
  }

  if (input.password.length < 6) {
    throw createHttpError('password must be at least 6 characters', 400);
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw createHttpError('User with this email already exists', 409);
  }

  const passwordHash = await hashPassword(input.password);

  const created = await withTransaction(async (client) => {
    const user = await createUser(client, {
      email,
      phone,
      passwordHash,
      fullName
    });

    const roleId = await ensureRole(client, 'client');
    await assignRole(client, user.id, roleId);

    return user;
  });

  const roles = await getUserRoles(created.id);
  const user = toAuthUser(created, roles);
  return makeAuthResult(user);
}

/**
 * Аутентифицирует пользователя по email/паролю и возвращает JWT и данные пользователя.
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  if (!email || !input.password) {
    throw createHttpError('email and password are required', 400);
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw createHttpError('Invalid credentials', 401);
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw createHttpError('Invalid credentials', 401);
  }

  const roles = await getUserRoles(user.id);
  const authUser = toAuthUser(user, roles);
  return makeAuthResult(authUser);
}
