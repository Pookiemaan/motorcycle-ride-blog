import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken, secureCookieOptions, verifyCsrfHeader } from '@/lib/security';

export async function POST(req: NextRequest) {
  try { verifyCsrfHeader(req); } catch { return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 }); }
  const refresh = req.cookies.get('refresh_token')?.value;
  if (refresh) await prisma.refreshToken.deleteMany({ where: { tokenHash: hashToken(refresh) } }).catch(() => null);
  const res = NextResponse.json({ ok: true });
  const opts = secureCookieOptions();
  res.cookies.set('access_token', '', { ...opts, maxAge: 0 });
  res.cookies.set('refresh_token', '', { ...opts, maxAge: 0 });
  res.cookies.set('csrf_token', '', { ...opts, httpOnly: false, maxAge: 0 });
  return res;
}
