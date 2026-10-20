import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Lock, ShieldCheck, KeyRound, Smartphone, LogOut, CheckCircle2 } from 'lucide-react';
import { useAdminAuth, logoutAdmin } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/account')({
  head: () => ({
    meta: [
      { title: 'Account Security — Blend Admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminAccountPage,
});

function AdminAccountPage() {
  const { user } = useAdminAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 12) {
      toast.error('Password must be at least 12 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isSupabaseConfigured) {
      toast.info('Local mode: Connect Supabase to enable real password updates.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (confirm('Are you sure you want to log out of all active devices?')) {
      await logoutAdmin();
      toast.success('Signed out from all devices');
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div className="border-b border-stone-800 pb-4">
        <h1 className="font-serif text-2xl font-semibold text-stone-100">Account & Security</h1>
        <p className="text-xs text-stone-400 mt-0.5">
          Manage your login credentials, two-factor authentication, and active sessions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-stone-200">
            <ShieldCheck size={18} className="text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Admin Profile</h2>
          </div>

          <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-2">
            <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Active Account</span>
            <p className="text-sm font-medium text-stone-100 font-mono">
              {user?.email || 'admin@blenddecor.com'}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
              <CheckCircle2 size={13} />
              <span>Full Studio Administrator Rights</span>
            </div>
          </div>

          {/* 2FA Status Card */}
          <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
                <Smartphone size={14} className="text-amber-400" />
                Two-Factor (2FA) TOTP
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Supported
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Supabase Authentication supports TOTP Authenticator apps (Google Authenticator, Apple Passwords, 1Password) for maximum account defense.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleLogoutAll}
              className="w-full text-xs border-red-900/40 bg-red-950/20 text-red-300 hover:bg-red-900/40 rounded-xl h-11"
            >
              <LogOut size={14} className="mr-2" />
              Sign Out of All Devices
            </Button>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-stone-200">
            <KeyRound size={18} className="text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Update Password</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPw" className="text-xs text-stone-300">
                New Password (minimum 12 characters)
              </Label>
              <Input
                id="newPw"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPw" className="text-xs text-stone-300">
                Confirm New Password
              </Label>
              <Input
                id="confirmPw"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/20 mt-2"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
