import type { PoolClient } from "pg";
import { getPool } from "../db/pool";
import type { RoleCode } from "../types/auth";

export interface UserRow {
  id: number;
  email: string;
  phone: string | null;
  passwordHash: string;
  fullName: string;
}

const ROLE_NAMES: Record<RoleCode, string> = {
  client: "Клиент",
  admin: "Администратор",
  courier: "Курьер",
};

/**
 * Выполняет callback внутри транзакции БД.
 * При успехе делает commit, при ошибке rollback.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Ищет пользователя по нормализованному email.
 */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const pool = getPool();
  const query = `
    SELECT id, email, phone, password_hash AS "passwordHash", full_name AS "fullName"
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const result = await pool.query<UserRow>(query, [email]);
  return result.rows[0] || null;
}

/**
 * Создаёт новую запись пользователя.
 */
export async function createUser(
  client: PoolClient,
  data: {
    email: string;
    phone: string | null;
    passwordHash: string;
    fullName: string;
  },
): Promise<UserRow> {
  const query = `
    INSERT INTO users (email, phone, password_hash, full_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, phone, password_hash AS "passwordHash", full_name AS "fullName"
  `;

  const result = await client.query<UserRow>(query, [
    data.email,
    data.phone,
    data.passwordHash,
    data.fullName,
  ]);
  return result.rows[0];
}

/**
 * Гарантирует существование роли и возвращает её id.
 */
export async function ensureRole(
  client: PoolClient,
  roleCode: RoleCode,
): Promise<number> {
  const existing = await client.query<{ id: number }>(
    "SELECT id FROM roles WHERE code = $1 LIMIT 1",
    [roleCode],
  );
  if (existing.rows[0]) {
    return existing.rows[0].id;
  }

  const created = await client.query<{ id: number }>(
    "INSERT INTO roles (code, name) VALUES ($1, $2) RETURNING id",
    [roleCode, ROLE_NAMES[roleCode]],
  );

  return created.rows[0].id;
}

/**
 * Назначает роль пользователю, если связи ещё нет.
 */
export async function assignRole(
  client: PoolClient,
  userId: number,
  roleId: number,
): Promise<void> {
  await client.query(
    "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING",
    [userId, roleId],
  );
}

/**
 * Возвращает роли пользователя, нормализованные к кодам ролей API.
 */
export async function getUserRoles(userId: number): Promise<RoleCode[]> {
  const pool = getPool();
  const query = `
    SELECT r.code
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = $1
    ORDER BY r.code
  `;

  const result = await pool.query<{ code: string }>(query, [userId]);
  const mapped = result.rows
    .map((row) => normalizeRoleCode(row.code))
    .filter((role): role is RoleCode => role !== null);

  return Array.from(new Set(mapped));
}

function normalizeRoleCode(code: string): RoleCode | null {
  if (code === "client" || code === "admin" || code === "courier") {
    return code;
  }

  return null;
}
