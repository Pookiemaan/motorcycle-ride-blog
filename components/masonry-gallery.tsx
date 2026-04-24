import Image from 'next/image';
export function MasonryGallery({ assets }: { assets: any[] }) {
  return <div className="columns-1 gap-4 md:columns-2 xl:columns-3 2xl:columns-4">{assets.map((asset) => <figure key={asset.id} className="mb-4 overflow-hidden rounded-[26px] border border-white/10 bg-white/5"><div className="relative aspect-[4/5]"><Image src={asset.url} alt={asset.altText || asset.fileName} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" /></div></figure>)}</div>;
}
