import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/security';
export async function GET(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });
  try {
    const { payload } = await verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: String(payload.sub) }, select: { id: true, email: true, role: true } });
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user });
  } catch { return NextResponse.json({ user: null }, { status: 401 }); }
}
