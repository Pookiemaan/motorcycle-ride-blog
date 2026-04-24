import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postSchema } from '@/lib/validation';
import { sanitizeHtml } from '@/lib/sanitize';
import { makeUniqueSlug } from '@/lib/slug';
import { verifyAccessToken, verifyCsrfHeader } from '@/lib/security';

async function getUser(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  if (!token) return null;
  try { const { payload } = await verifyAccessToken(token); return payload; } catch { return null; }
}

export async function GET() {
  const posts = await prisma.post.findMany({ where: { status: 'PUBLISHED' }, orderBy: { updatedAt: 'desc' }, include: { featuredImage: true } });
  return NextResponse.json({ posts: posts.map((p) => ({ ...p, featuredImageUrl: p.featuredImage ? `/api/media/${p.featuredImage.id}/file` : null })) });
}

export async function POST(req: NextRequest) {
  try { verifyCsrfHeader(req); } catch { return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 }); }
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });

  const baseSlug = makeUniqueSlug(parsed.data.title);
  const slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
  const post = await prisma.post.create({
    data: {
      slug, title: parsed.data.title, description: parsed.data.description, richDescription: sanitizeHtml(parsed.data.richDescription),
      rideDate: new Date(parsed.data.rideDate), locationTags: parsed.data.locationTags, rideStats: parsed.data.rideStats || {},
      featuredImageId: parsed.data.featuredImageId || undefined, gpxUrl: parsed.data.gpxUrl || undefined,
      status: parsed.data.status, seoTitle: parsed.data.seoTitle || parsed.data.title, seoDescription: parsed.data.seoDescription || parsed.data.description,
      authorId: String(user.sub), publishedAt: parsed.data.status === 'PUBLISHED' ? new Date() : null,
    },
    include: { featuredImage: true },
  });
  return NextResponse.json({ post: { ...post, featuredImageUrl: post.featuredImage ? `/api/media/${post.featuredImage.id}/file` : null } });
}
