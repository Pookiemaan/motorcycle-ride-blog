'use client';
import { useEffect, useState } from 'react';
import { Input, Button } from '@/components/ui';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgot, setForgot] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const csrf = typeof document !== 'undefined' ? document.getElementById('csrf-token')?.getAttribute('value') || '' : '';
  const resetToken = params.get('reset');

  useEffect(() => { if (resetToken) setForgot(true); }, [resetToken]);

  async function submit() {
    if (resetToken) {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify({ token: resetToken, password }) });
      setMessage(res.ok ? 'Password reset. You can now log in.' : 'Reset failed.');
      return;
    }
    if (forgot) {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify({ email }) });
      setMessage((await res.json()).message || 'Check your email.');
      return;
    }
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify({ email, password }) });
    if (!res.ok) { setMessage('Invalid credentials'); return; }
    router.push('/dashboard'); router.refresh();
  }

  return <main className="min-h-screen px-4 py-16 md:px-8"><div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl"><p className="text-xs uppercase tracking-[0.35em] text-white/50">Admin access</p><h1 className="display-serif mt-3 text-5xl">Login</h1><div className="mt-8 space-y-4"><Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><div className="flex items-center justify-between text-sm text-white/55"><button type="button" onClick={() => setForgot(!forgot)}>{forgot ? 'Back to login' : 'Forgot password?'}</button><Button onClick={submit}>{resetToken ? 'Reset password' : forgot ? 'Send reset link' : 'Login'}</Button></div>{message && <p className="text-sm text-amber-200">{message}</p>}</div></div></main>;
}
