'use client';
import { useMemo, useState } from 'react';
import { Button, Input, Textarea, Pill } from './ui';
import { motion } from 'framer-motion';

type MediaItem = { id: string; url: string; fileName: string; mimeType: string; altText?: string | null; status?: string };

export function DashboardClient({ initialPosts, media }: { initialPosts: any[]; media: MediaItem[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [selected, setSelected] = useState<any | null>(null);
  const [draft, setDraft] = useState<any>({ title: '', description: '', richDescription: '<p>Write ride story here.</p>', rideDate: new Date().toISOString(), locationTags: [], status: 'DRAFT' });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const csrf = typeof document !== 'undefined' ? document.getElementById('csrf-token')?.getAttribute('value') || '' : '';
  const stats = useMemo(() => ({ total: posts.length, published: posts.filter((p) => p.status === 'PUBLISHED').length, drafts: posts.filter((p) => p.status === 'DRAFT').length }), [posts]);

  async function savePost() {
    const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify(draft) });
    if (!res.ok) { alert('Failed to save post'); return; }
    const json = await res.json();
    setPosts((p) => [json.post, ...p]);
    setDraft({ title: '', description: '', richDescription: '<p>Write ride story here.</p>', rideDate: new Date().toISOString(), locationTags: [], status: 'DRAFT' });
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: { 'x-csrf-token': csrf } });
    setPosts((p) => p.filter((x) => x.id !== id));
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    setUploading(true);
    setUploadMsg('');
    try {
      for (const file of list) {
        const kind = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
        const metaRes = await fetch('/api/media/sign-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
          body: JSON.stringify({ fileName: file.name, mimeType: file.type, size: file.size, kind, altText: file.name }),
        });
        if (!metaRes.ok) throw new Error('Could not sign upload');
        const signed = await metaRes.json();
        const put = await fetch(signed.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        if (!put.ok) throw new Error(`Upload failed for ${file.name}`);
        await fetch(`/api/media/${signed.id}/ready`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
          body: JSON.stringify({ status: 'READY' }),
        });
      }
      setUploadMsg('Upload complete. Refreshing...');
      window.location.reload();
    } catch (e: any) {
      setUploadMsg(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><div className="space-y-6"><div className="grid gap-4 md:grid-cols-3">{[['Total Posts', stats.total], ['Published', stats.published], ['Drafts', stats.drafts]].map(([label, value]) => <div key={String(label)} className="glass rounded-[28px] p-5"><div className="text-sm text-white/55">{label}</div><div className="mt-2 text-4xl font-semibold">{String(value)}</div></div>)}</div><div className="glass rounded-[28px] p-5"><h2 className="display-serif text-3xl">Create post</h2><div className="mt-5 grid gap-4"><Input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /><Input placeholder="Short description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /><Textarea placeholder="Rich HTML description" value={draft.richDescription} onChange={(e) => setDraft({ ...draft, richDescription: e.target.value })} /><div className="grid gap-4 md:grid-cols-2"><Input type="datetime-local" value={draft.rideDate.slice(0,16)} onChange={(e) => setDraft({ ...draft, rideDate: new Date(e.target.value).toISOString() })} /><select className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option>DRAFT</option><option>PUBLISHED</option></select></div><div className="flex gap-3"><Input placeholder="Add location tag and press Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const t = tagInput.trim(); if (t) setDraft({ ...draft, locationTags: Array.from(new Set([...(draft.locationTags || []), t])) }); setTagInput(''); }}} /><Button onClick={savePost}>Save</Button></div><div className="flex flex-wrap gap-2">{(draft.locationTags || []).map((t: string) => <Pill key={t}>{t}</Pill>)}</div></div></div><div className="glass rounded-[28px] p-5"><h2 className="display-serif text-3xl">Media upload</h2><div className="mt-4 rounded-3xl border border-dashed border-white/15 bg-black/20 p-6" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files); }}><p className="text-sm text-white/60">Drag and drop images or videos here, or choose files manually.</p><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime" className="mt-4 block w-full text-sm text-white/60" onChange={(e) => e.target.files && uploadFiles(e.target.files)} /></div><p className="mt-3 text-sm text-white/50">{uploading ? 'Uploading…' : uploadMsg}</p></div><div className="glass rounded-[28px] p-5"><h2 className="display-serif text-3xl">Posts</h2><div className="mt-4 space-y-3">{posts.map((post) => <motion.div key={post.id} whileHover={{ x: 4 }} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"><div><div className="font-medium">{post.title}</div><div className="text-xs text-white/50">{post.status} · {new Date(post.rideDate).toLocaleDateString()} · {post.slug}</div></div><div className="flex gap-2"><Button onClick={() => setSelected(post)}>Edit</Button><Button onClick={() => deletePost(post.id)}>Delete</Button></div></motion.div>)}</div></div></div><div className="space-y-6"><div className="glass rounded-[28px] p-5"><h2 className="display-serif text-3xl">Media library</h2><div className="mt-4 grid grid-cols-2 gap-3">{media.map((m) => <div key={m.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"><img src={m.url} alt={m.altText || m.fileName} className="h-40 w-full object-cover" /></div>)}</div></div>{selected && <div className="glass rounded-[28px] p-5"><h2 className="display-serif text-3xl">Selected post</h2><pre className="mt-4 overflow-auto rounded-2xl bg-black/30 p-4 text-xs text-white/70">{JSON.stringify(selected, null, 2)}</pre></div>}</div></div>;
}
