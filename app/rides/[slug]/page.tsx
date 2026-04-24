import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
async function getPost(slug: string) { return prisma.post.findUnique({ where: { slug }, include: { media: true, featuredImage: true, author: true } }); }
export default async function RidePage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post || post.status !== 'PUBLISHED') return notFound();
  const media = [post.featuredImage, ...post.media.filter(Boolean)].filter(Boolean) as any[];
  return <main><Navbar /><article className="mx-auto max-w-5xl px-4 py-12 md:px-8"><p className="text-xs uppercase tracking-[0.35em] text-amber-200/60">{post.locationTags.join(' · ')}</p><h1 className="display-serif mt-4 text-5xl md:text-7xl">{post.title}</h1><p className="mt-4 text-white/55">{new Date(post.rideDate).toLocaleDateString()} · {post.description}</p><div className="mt-10 grid gap-6">{media.map((m) => <div key={m.id} className="relative aspect-[16/9] overflow-hidden rounded-[30px] border border-white/10"><Image src={`/api/media/${m.id}/file`} alt={m.altText || m.fileName} fill className="object-cover" /></div>)}</div><div className="prose-lite glass mt-10 rounded-[30px] p-8"><div dangerouslySetInnerHTML={{ __html: post.richDescription }} /></div>{post.rideStats && <div className="glass mt-10 grid gap-4 rounded-[30px] p-8 md:grid-cols-3">{Object.entries(post.rideStats as any).map(([k,v]) => <div key={k}><div className="text-sm text-white/50">{k}</div><div className="mt-1 text-3xl">{String(v)}</div></div>)}</div>}</article><Footer /></main>;
}
