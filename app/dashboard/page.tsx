import { prisma } from '@/lib/prisma';
import { DashboardClient } from '@/components/dashboard-client';
import { Navbar } from '@/components/navbar';
export const dynamic = 'force-dynamic';
async function loadData() {
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: 'desc' }, include: { featuredImage: true } });
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 24 });
  return { posts: posts.map((p) => ({ ...p, featuredImageUrl: p.featuredImage ? `/api/media/${p.featuredImage.id}/file` : null })), media: media.map((m) => ({ ...m, url: `/api/media/${m.id}/file` })) };
}
export default async function DashboardPage() {
  const { posts, media } = await loadData();
  return <main className="min-h-screen"><Navbar /><div className="mx-auto max-w-7xl px-4 py-10 md:px-8"><h1 className="display-serif text-5xl">Dashboard</h1><p className="mt-3 text-white/60">Manage posts, media, and publishing workflow.</p><div className="mt-8"><DashboardClient initialPosts={posts} media={media} /></div></div></main>;
}
