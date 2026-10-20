import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Package,
  FolderKanban,
  Sliders,
  Trash2,
  ShieldCheck,
  HelpCircle,
  Lock,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAdminAuth, logoutAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Collections', href: '/admin/collections', icon: FolderKanban },
  { name: 'Site Settings', href: '/admin/settings', icon: Sliders },
  { name: 'Trash & Undo', href: '/admin/trash', icon: Trash2 },
  { name: 'Audit Log', href: '/admin/audit-log', icon: ShieldCheck },
  { name: 'Help Guide', href: '/admin/help', icon: HelpCircle },
  { name: 'Account & 2FA', href: '/admin/account', icon: Lock },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = location.pathname;
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = async () => {
    await logoutAdmin();
    navigate({ to: '/admin/login' });
  };

  // If user is not authenticated and not on login page, redirect to login
  React.useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      navigate({ to: '/admin/login' });
    }
  }, [loading, user, isLoginPage, navigate]);

  // While checking auth status, show secure loader to prevent UI flashing
  if (loading && !isLoginPage) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-400 text-xs font-mono tracking-widest uppercase">Verifying admin access...</p>
      </div>
    );
  }

  // If on login page, render clean auth wrapper without sidebar
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-between">
        <header className="border-b border-stone-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl tracking-wider text-amber-100 font-semibold">BLEND</span>
            <span className="text-xs font-mono uppercase bg-stone-800 text-stone-400 px-2.5 py-0.5 rounded-full border border-stone-700">
              Admin Portal
            </span>
          </div>
          <Link
            to="/"
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1.5"
          >
            <span>Back to Public Site</span>
            <ExternalLink size={13} />
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>

        <footer className="border-t border-stone-800/80 px-6 py-4 text-center text-xs text-stone-500">
          Blend Studio Admin &copy; {new Date().getFullYear()} &bull; Handcrafted Resin & Wood
        </footer>
        <Toaster richColors position="bottom-right" />
      </div>
    );
  }

  // If not authenticated, block content completely
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-stone-900 border border-stone-800 p-8 rounded-3xl max-w-md w-full shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock size={22} />
          </div>
          <h2 className="text-xl font-serif text-stone-100 font-medium">Administrator Access Only</h2>
          <p className="text-xs text-stone-400 mt-2 mb-6 leading-relaxed">
            This management console is restricted to authorized studio personnel. Please sign in to continue.
          </p>
          <Link to="/admin/login">
            <Button className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold h-11 rounded-xl">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between border-b border-stone-800 bg-stone-900/90 px-4 py-3 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-lg tracking-wider text-amber-100 font-semibold">BLEND</span>
          <span className="text-[10px] font-mono uppercase bg-stone-800 text-stone-400 px-2 py-0.5 rounded border border-stone-700">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="p-2 text-stone-400 hover:text-stone-200 transition-colors rounded-lg hover:bg-stone-800"
            title="View public website"
          >
            <ExternalLink size={18} />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-stone-300 hover:text-white hover:bg-stone-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-800 bg-stone-900/60 backdrop-blur-sm shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-5 border-b border-stone-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl tracking-wider text-amber-100 font-semibold">BLEND</span>
              <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Studio Management Portal</p>
          </div>
        </div>

        {/* Supabase status indicator */}
        {!isSupabaseConfigured && (
          <div className="mx-3 mt-3 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Setup Required</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                Add Supabase credentials to <code className="bg-amber-950 px-1 py-0.5 rounded">.env.local</code> to activate live database.
              </p>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-amber-400' : 'text-stone-400'} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile & actions */}
        <div className="p-3 border-t border-stone-800/80 bg-stone-900/30">
          <div className="px-3 py-2 flex items-center justify-between mb-2">
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-stone-200 truncate">
                {user?.email || 'Admin'}
              </p>
              <p className="text-[10px] text-stone-400">Authenticated Studio Manager</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700/60"
            >
              <span>View Site</span>
              <ExternalLink size={12} />
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-medium text-red-300 bg-red-950/30 hover:bg-red-900/50 hover:text-red-200 border-red-900/40 rounded-lg"
              title="Log out"
            >
              <LogOut size={13} className="mr-1" />
              <span>Exit</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex flex-col">
          <div className="bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg tracking-wider text-amber-100 font-semibold">BLEND</span>
              <span className="text-xs font-mono uppercase bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="text-stone-300 hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                      : 'text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon size={20} className={isActive ? 'text-amber-400' : 'text-stone-400'} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-stone-800 bg-stone-900/80 flex gap-2">
            <Link
              to="/"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-stone-200 bg-stone-800 rounded-xl"
            >
              <span>View Public Website</span>
              <ExternalLink size={14} />
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="py-3 px-4 text-sm font-medium text-red-300 bg-red-950/40 border-red-900/40 rounded-xl"
            >
              <LogOut size={16} className="mr-2" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
