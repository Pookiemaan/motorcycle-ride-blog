import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken, secureCookieOptions, signAccessToken, verifyRefreshToken } from '@/lib/security';
export async function POST(req: NextRequest) {
  const refresh = req.cookies.get('refresh_token')?.value;
  if (!refresh) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await verifyRefreshToken(refresh); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const tokenHash = hashToken(refresh);
  const dbToken = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!dbToken || dbToken.expiresAt < new Date()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (dbToken.lastSeenAt.getTime() < Date.now() - 15 * 60 * 1000) { await prisma.refreshToken.delete({ where: { tokenHash } }).catch(() => null); return NextResponse.json({ error: 'Session expired due to inactivity' }, { status: 401 }); }
  const claims = { sub: dbToken.user.id, email: dbToken.user.email, role: dbToken.user.role };
  const access = await signAccessToken(claims);
  await prisma.refreshToken.update({ where: { tokenHash }, data: { lastSeenAt: new Date() } });
  const res = NextResponse.json({ ok: true, user: claims });
  res.cookies.set('access_token', access, { ...secureCookieOptions(), maxAge: 60 * 15 });
  return res;
}
