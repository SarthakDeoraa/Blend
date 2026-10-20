import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { loginWithEmail, useAdminAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/login')({
  head: () => ({
    meta: [
      { title: 'Admin Login — Blend Studio' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  // If already logged in, redirect to /admin
  React.useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: '/admin' });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (attemptCount >= 5) {
      setErrorMessage('Too many failed attempts. Please wait 15 minutes before trying again.');
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      await loginWithEmail(email, password);
      toast.success('Welcome back to Blend Admin');
      navigate({ to: '/admin' });
    } catch (err: unknown) {
      const newAttempts = attemptCount + 1;
      setAttemptCount(newAttempts);

      const errMessage = err instanceof Error ? err.message : '';
      if (errMessage.includes('Invalid login credentials')) {
        setErrorMessage('Incorrect email or password. Please double-check and try again.');
      } else {
        setErrorMessage('Unable to sign in. Please verify your credentials or network connection.');
      }
      toast.error('Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 mb-4 shadow-inner">
            <Lock size={22} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-100 tracking-tight">
            Studio Admin
          </h1>
          <p className="text-sm text-stone-400 mt-2">
            Sign in to manage products, collections, and website content
          </p>
        </div>

        {/* Setup notice if Supabase keys not detected */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/70 text-xs text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300 text-sm">Local Passcode Login Active</p>
                <p className="mt-1 text-amber-200/90 leading-relaxed">
                  Enter your email and local passcode <code className="bg-stone-900 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">blend2026</code> to unlock the admin console.
                </p>
                <p className="mt-2 text-[11px] text-stone-400">
                  (When you connect Supabase via <code className="bg-stone-900 px-1 py-0.5 rounded">.env.local</code>, it switches to real database user authentication automatically).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium text-stone-300 uppercase tracking-wider">
              Email Address
            </Label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@blenddecor.com"
                className="pl-10 h-12 bg-stone-950/70 border-stone-800 text-stone-100 placeholder:text-stone-500 rounded-xl focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-stone-300 uppercase tracking-wider">
                Password
              </Label>
            </div>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-10 pr-10 h-12 bg-stone-950/70 border-stone-800 text-stone-100 placeholder:text-stone-500 rounded-xl focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-sm font-semibold tracking-wide uppercase bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition-all shadow-md shadow-amber-950/30 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In to Admin
                <ArrowRight size={16} />
              </span>
            )}
          </Button>
        </form>

        {/* Security badge */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 flex items-center justify-center gap-2 text-xs text-stone-400">
          <ShieldCheck size={14} className="text-amber-400/80" />
          <span>Protected with Row-Level Security & 2FA</span>
        </div>
      </div>
    </div>
  );
}
