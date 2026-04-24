import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postSchema } from '@/lib/validation';
import { sanitizeHtml } from '@/lib/sanitize';
import { verifyAccessToken, verifyCsrfHeader } from '@/lib/security';
async function getUser(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  if (!token) return null;
  try { const { payload } = await verifyAccessToken(token); return payload; } catch { return null; }
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { verifyCsrfHeader(req); } catch { return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 }); }
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const post = await prisma.post.update({ where: { id: params.id }, data: { title: parsed.data.title, description: parsed.data.description, richDescription: sanitizeHtml(parsed.data.richDescription), rideDate: new Date(parsed.data.rideDate), locationTags: parsed.data.locationTags, rideStats: parsed.data.rideStats || {}, featuredImageId: parsed.data.featuredImageId || undefined, gpxUrl: parsed.data.gpxUrl || undefined, status: parsed.data.status, seoTitle: parsed.data.seoTitle || parsed.data.title, seoDescription: parsed.data.seoDescription || parsed.data.description, publishedAt: parsed.data.status === 'PUBLISHED' ? new Date() : null } });
  return NextResponse.json({ post });
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try { verifyCsrfHeader(req); } catch { return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 }); }
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
