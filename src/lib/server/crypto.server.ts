import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scryptAsync(secret, salt, 32)) as Buffer;
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const key = Buffer.from(keyHex, "hex");
  const next = (await scryptAsync(secret, salt, 32)) as Buffer;
  if (next.length !== key.length) return false;
  return timingSafeEqual(next, key);
}

export function randomToken(): string {
  return randomBytes(32).toString("hex");
}
