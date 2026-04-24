import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MasonryGallery } from '@/components/masonry-gallery';
import { prisma } from '@/lib/prisma';
export const revalidate = 60;
export default async function GalleryPage() {
  const assets = await prisma.mediaAsset.findMany({ where: { status: 'READY', post: { status: 'PUBLISHED' } }, orderBy: { createdAt: 'desc' }, take: 80, include: { post: true } });
  return <main><Navbar /><section className="mx-auto max-w-7xl px-4 py-16 md:px-8"><h1 className="display-serif text-6xl">Gallery</h1><p className="mt-3 text-white/60">A masonry archive of all published media.</p><div className="mt-8"><MasonryGallery assets={assets.map((m) => ({ ...m, url: `/api/media/${m.id}/file` }))} /></div></section><Footer /></main>;
}
