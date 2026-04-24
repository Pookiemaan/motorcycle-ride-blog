import { NextRequest, NextResponse } from 'next/server';
import { mediaCreateSchema } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { signUploadUrl, storageConfig } from '@/lib/storage';
import { verifyAccessToken, verifyCsrfHeader } from '@/lib/security';

export async function POST(req: NextRequest) {
  try { verifyCsrfHeader(req); } catch { return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 }); }
  const token = req.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await verifyAccessToken(token); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const parsed = mediaCreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const allowed = ['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime'];
  if (!allowed.includes(parsed.data.mimeType)) return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  if (parsed.data.size > (parsed.data.kind === 'VIDEO' ? 500 * 1024 * 1024 : 20 * 1024 * 1024)) return NextResponse.json({ error: 'File too large' }, { status: 400 });

  const key = `uploads/${Date.now()}-${parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { bucket } = storageConfig();
  const record = await prisma.mediaAsset.create({ data: { key, bucket, provider: process.env.STORAGE_PROVIDER || 's3', kind: parsed.data.kind, mimeType: parsed.data.mimeType, fileName: parsed.data.fileName, size: parsed.data.size, altText: parsed.data.altText, status: 'UPLOADING' } });
  const uploadUrl = await signUploadUrl(key, parsed.data.mimeType);
  return NextResponse.json({ id: record.id, key, uploadUrl });
}
