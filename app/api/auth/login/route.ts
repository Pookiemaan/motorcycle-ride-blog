import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { getCsrfToken, hashToken, secureCookieOptions, signAccessToken, signRefreshToken, verifyCsrfHeader } from '@/lib/security';

export async function POST(req: NextRequest) {
  try { verifyCsrfHeader(req); } catch { return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 }); }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const rl = rateLimit(`login:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });

  const parsed = loginSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const claims = { sub: user.id, email: user.email, role: user.role };
  const access = await signAccessToken(claims);
  const refresh = await signRefreshToken(claims);

  await prisma.refreshToken.create({
    data: { tokenHash: hashToken(refresh), userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), lastSeenAt: new Date() },
  });

  const res = NextResponse.json({ ok: true });
  const opts = secureCookieOptions();
  res.cookies.set('access_token', access, { ...opts, maxAge: 60 * 15 });
  res.cookies.set('refresh_token', refresh, { ...opts, maxAge: 60 * 60 * 24 * 30 });
  res.cookies.set('csrf_token', getCsrfToken(), { ...opts, httpOnly: false, maxAge: 60 * 60 * 24 * 30 });
  return res;
}
