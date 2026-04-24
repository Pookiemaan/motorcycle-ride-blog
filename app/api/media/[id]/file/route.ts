import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signDownloadUrl, storageConfig } from '@/lib/storage';
import { verifyAccessToken } from '@/lib/security';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const media = await prisma.mediaAsset.findUnique({ where: { id: params.id }, include: { post: true } });
  if (!media) return new Response('Not found', { status: 404 });

  const token = req.cookies.get('access_token')?.value;
  const isAuthed = token ? await verifyAccessToken(token).then(() => true).catch(() => false) : false;
  const isPublic = media.status === 'READY' && (!media.postId || media.post?.status === 'PUBLISHED');

  if (!isPublic && !isAuthed) return new Response('Not found', { status: 404 });
  const url = await signDownloadUrl(media.key);
  return Response.redirect(url, 302);
}
