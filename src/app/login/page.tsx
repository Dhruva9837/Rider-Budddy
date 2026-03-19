'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      router.push('/profile');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-textPrimary tracking-tight">RideBuddy</h1>
          <p className="text-textSecondary text-sm mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-surface rounded-xl border border-divider/80 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-all text-textPrimary placeholder:text-textSecondary/40 text-sm"
              placeholder="Email"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-surface rounded-xl border border-divider/80 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-all text-textPrimary placeholder:text-textSecondary/40 text-sm"
              placeholder="Password"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-textSecondary text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
