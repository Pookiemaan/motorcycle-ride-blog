import crypto from 'crypto';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

const accessSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
const refreshSecret = new TextEncoder().encode(process.env.REFRESH_SECRET || 'dev-refresh-secret');
const csrfSecret = process.env.CSRF_SECRET || 'dev-csrf-secret';

export type SessionClaims = { sub: string; email: string; role: string };

export async function signAccessToken(claims: SessionClaims) {
  return new SignJWT({ email: claims.email, role: claims.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret);
}

export async function signRefreshToken(claims: SessionClaims) {
  return new SignJWT({ email: claims.email, role: claims.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string) { return jwtVerify(token, accessSecret, { algorithms: ['HS256'] }); }
export async function verifyRefreshToken(token: string) { return jwtVerify(token, refreshSecret, { algorithms: ['HS256'] }); }
export function hashToken(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }
export function getCsrfToken() { return csrfSecret; }

export function secureCookieOptions() {
  return { httpOnly: true as const, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', domain: process.env.COOKIE_DOMAIN || undefined };
}

export function verifyCsrfHeader(req: Request | { headers: Headers }) {
  const header = req.headers.get('x-csrf-token');
  const cookie = cookies().get('csrf_token')?.value;
  const expected = getCsrfToken();
  if (!header || !cookie || header !== expected || cookie !== expected) throw new Error('Invalid CSRF token');
}
