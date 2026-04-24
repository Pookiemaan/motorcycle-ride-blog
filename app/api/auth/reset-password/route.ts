import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hashToken, verifyCsrfHeader } from '@/lib/security';
import { resetSchema } from '@/lib/validation';
export async function POST(req: NextRequest) {
  try { verifyCsrfHeader(req); } catch { return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 }); }
  const parsed = resetSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const tokenHash = hashToken(parsed.data.token);
  const record = await prisma.resetToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!record || record.expiresAt < new Date() || record.usedAt) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
  await prisma.resetToken.update({ where: { tokenHash }, data: { usedAt: new Date() } });
  await prisma.refreshToken.deleteMany({ where: { userId: record.userId } });
  return NextResponse.json({ ok: true });
}
