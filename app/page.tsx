import { prisma } from '@/lib/prisma';
import { Hero } from '@/components/hero';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PostCard } from '@/components/post-card';
export const revalidate = 60;
async function getPosts() {
  const posts = await prisma.post.findMany({ where: { status: 'PUBLISHED' }, orderBy: { rideDate: 'desc' }, take: 12, include: { featuredImage: true } });
  return posts.map((p) => ({ ...p, featuredImageUrl: p.featuredImage ? `/api/media/${p.featuredImage.id}/file` : null }));
}
export default async function HomePage() {
  const posts = await getPosts();
  const featured = posts[0];
  return <main><Navbar /><Hero post={featured} /><section className="mx-auto max-w-7xl px-4 py-16 md:px-8"><div className="mb-8 flex items-end justify-between"><div><p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">Recent rides</p><h2 className="display-serif mt-2 text-4xl md:text-5xl">Latest journal entries</h2></div></div><div className="grid gap-6 lg:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div></section><Footer /></main>;
}
