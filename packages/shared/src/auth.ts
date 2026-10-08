import { hkdfSync } from 'node:crypto';
import { jwtDecrypt } from 'jose';

function deriveKey(secret: string, salt: string): Uint8Array {
  const key = hkdfSync(
    'sha256',
    Buffer.from(secret),
    Buffer.from(salt),
    Buffer.from(`Auth.js Generated Encryption Key (${salt})`),
    64
  );
  return new Uint8Array(key);
}

export type AuthjsSession = {
  sub?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  orgId?: string;
  role?: 'admin' | 'viewer';
  iat?: number;
  exp?: number;
  jti?: string;
  [key: string]: unknown;
};

const COOKIE_SALTS = ['authjs.session-token', '__Secure-authjs.session-token'];

export async function verifyAuthjsCookie(
  cookieValue: string,
  secret: string
): Promise<AuthjsSession | null> {
  if (!cookieValue) return null;

  for (const salt of COOKIE_SALTS) {
    try {
      const key = deriveKey(secret, salt);
      const { payload } = await jwtDecrypt(cookieValue, key);
      return payload as AuthjsSession;
    } catch {
      continue;
    }
  }
  return null;
}
