import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken, verifyCsrfHeader } from '@/lib/security';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try { verifyCsrfHeader(req); } catch { return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 }); }
  const token = req.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await verifyAccessToken(token); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const body = await req.json().catch(() => ({}));
  await prisma.mediaAsset.update({ where: { id: params.id }, data: { status: body.status || 'READY', thumbnailKey: body.thumbnailKey || undefined, width: body.width || undefined, height: body.height || undefined, duration: body.duration || undefined } });
  return NextResponse.json({ ok: true });
}
