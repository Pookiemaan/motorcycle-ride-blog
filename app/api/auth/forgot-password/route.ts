import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { forgotSchema } from '@/lib/validation';
import { sendResetEmail } from '@/lib/email';
import { hashToken } from '@/lib/security';
import { verifyCsrfHeader } from '@/lib/security';
export async function POST(req: NextRequest) {
  try { verifyCsrfHeader(req); } catch { return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 }); }
  const parsed = forgotSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' });
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.resetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 1000 * 60 * 30) } });
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/login?reset=${token}`;
  await sendResetEmail(user.email, url);
  return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' });
}
