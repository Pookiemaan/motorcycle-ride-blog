import { prisma } from '@/lib/prisma';
export async function GET() {
  const posts = await prisma.post.findMany({ where: { status: 'PUBLISHED' }, orderBy: { rideDate: 'desc' }, take: 20 });
  const items = posts.map((p) => `<item><title><![CDATA[${p.title}]]></title><link>${process.env.NEXT_PUBLIC_APP_URL}/rides/${p.slug}</link><guid>${p.id}</guid><pubDate>${new Date(p.publishedAt || p.rideDate).toUTCString()}</pubDate><description><![CDATA[${p.description}]]></description></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>Motorcycle Ride Journal</title><link>${process.env.NEXT_PUBLIC_APP_URL}</link><description>Motorcycle ride stories and media</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
