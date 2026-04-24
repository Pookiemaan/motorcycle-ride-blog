import Link from 'next/link';
import { Shield } from 'lucide-react';
export function Navbar() {
  return <header className="sticky top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8"><Link href="/" className="flex items-center gap-2"><Shield className="h-5 w-5 text-amber-300" /><span className="text-sm tracking-[0.35em] uppercase text-white/70">Ride Journal</span></Link><nav className="flex items-center gap-6 text-sm text-white/70"><Link href="/gallery">Gallery</Link><Link href="/about">About</Link><Link href="/login" className="rounded-full border border-white/10 px-4 py-2">Admin</Link></nav></div></header>;
}
