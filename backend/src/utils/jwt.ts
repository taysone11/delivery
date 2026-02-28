import { createHmac, timingSafeEqual } from "node:crypto";
import type { JwtPayloadData } from "../types/auth";

interface JwtPayload extends JwtPayloadData {
  iat: number;
  exp: number;
}

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return Buffer.from(padded, "base64");
}

function parseExpiresIn(expiresIn: string): number {
  const value = expiresIn.trim();
  const match = value.match(/^(\d+)([smhd])?$/);

  if (!match) {
    throw new Error("Invalid JWT_EXPIRES_IN format");
  }

  const amount = Number(match[1]);
  const unit = match[2] || "s";

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return amount * multipliers[unit];
}

function signPart(value: string, secret: string): string {
  return toBase64Url(createHmac("sha256", secret).update(value).digest());
}

/**
 * Подписывает JWT алгоритмом HS256 и возвращает компактную строку токена.
 */
export function signJwt(
  payload: JwtPayloadData,
  secret: string,
  expiresIn: string,
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseExpiresIn(expiresIn);

  const header = { alg: "HS256", typ: "JWT" };
  const body: JwtPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const headerPart = toBase64Url(JSON.stringify(header));
  const payloadPart = toBase64Url(JSON.stringify(body));
  const unsigned = `${headerPart}.${payloadPart}`;
  const signature = signPart(unsigned, secret);

  return `${unsigned}.${signature}`;
}

/**
 * Проверяет подпись JWT и срок действия, затем возвращает auth-payload.
 */
export function verifyJwt(token: string, secret: string): JwtPayloadData {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token");
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const unsigned = `${headerPart}.${payloadPart}`;
  const expectedSignature = signPart(unsigned, secret);

  const a = Buffer.from(signaturePart);
  const b = Buffer.from(expectedSignature);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid token signature");
  }

  const payloadJson = fromBase64Url(payloadPart).toString("utf8");
  const payload = JSON.parse(payloadJson) as Partial<JwtPayload>;

  if (
    !payload.sub ||
    !payload.email ||
    !Array.isArray(payload.roles) ||
    !payload.exp
  ) {
    throw new Error("Invalid token payload");
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    throw new Error("Token expired");
  }

  return {
    sub: String(payload.sub),
    email: String(payload.email),
    roles: payload.roles as JwtPayloadData["roles"],
  };
}
