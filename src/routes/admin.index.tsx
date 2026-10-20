import React, { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Package,
  FolderKanban,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { collections as localCollections } from '@/data/collections';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/admin/')({
  head: () => ({
    meta: [
      { title: 'Dashboard — Blend Studio Admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminDashboardPage,
});

interface DashboardStats {
  totalProducts: number;
  totalCollections: number;
  featuredCount: number;
  publishedCount: number;
  draftCount: number;
}

function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCollections: 0,
    featuredCount: 0,
    publishedCount: 0,
    draftCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!isSupabaseConfigured) {
        // Fallback to local hardcoded collections until database is populated
        const totalProds = localCollections.reduce((acc, col) => acc + col.products.length, 0);
        setStats({
          totalProducts: totalProds,
          totalCollections: localCollections.length,
          featuredCount: 4,
          publishedCount: totalProds,
          draftCount: 0,
        });
        setLoading(false);
        return;
      }

      try {
        const [prodsRes, colsRes, featRes] = await Promise.all([
          supabase.from('products').select('id, status', { count: 'exact' }).is('deleted_at', null),
          supabase.from('collections').select('id', { count: 'exact' }).is('deleted_at', null),
          supabase.from('products').select('id', { count: 'exact' }).eq('is_featured', true).is('deleted_at', null),
        ]);

        const products = (prodsRes.data || []) as { id: string; status: string }[];
        const published = products.filter((p) => p.status === 'published').length;
        const drafts = products.filter((p) => p.status === 'draft').length;

        setStats({
          totalProducts: prodsRes.count || products.length,
          totalCollections: colsRes.count || 0,
          featuredCount: featRes.count || 0,
          publishedCount: published,
          draftCount: drafts,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/30 border border-stone-800 p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <Sparkles size={14} />
            <span>Studio Control Center</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-normal text-stone-100 tracking-tight">
            Welcome to Blend Admin
          </h1>
          <p className="text-stone-400 text-sm md:text-base max-w-2xl">
            Manage your resin art products, update prices, add new handcrafted collections, and organize your showcase.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link to="/admin/products/new">
            <Button className="h-11 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950/20 transition-all hover:scale-102">
              <Plus size={18} strokeWidth={2.5} />
              <span>Add New Product</span>
            </Button>
          </Link>
          <Link to="/admin/collections/new">
            <Button variant="outline" className="h-11 px-5 bg-stone-800/80 hover:bg-stone-800 text-stone-200 border-stone-700 font-medium rounded-xl flex items-center gap-2 transition-all">
              <FolderKanban size={18} />
              <span>Add Collection</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Database connection alert if not configured */}
      {!isSupabaseConfigured && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200 text-base">Local Preview Mode</p>
              <p className="text-xs text-amber-200/80 mt-1 max-w-2xl">
                Currently displaying local hardcoded catalogue data. To activate real-time database management, run migrations in <code className="bg-amber-950 px-1 py-0.5 rounded">supabase/migrations/</code> and enter your Supabase keys in <code className="bg-amber-950 px-1 py-0.5 rounded">.env.local</code>.
              </p>
            </div>
          </div>
          <Link to="/admin/help">
            <Button variant="outline" size="sm" className="bg-amber-950/60 border-amber-700/80 text-amber-200 hover:bg-amber-900/80 text-xs shrink-0 rounded-xl">
              View Setup Steps
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Products */}
        <div className="bg-stone-900/70 border border-stone-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-stone-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">Total Products</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-100">
              {loading ? '...' : stats.totalProducts}
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 size={12} />
              <span>Active in catalogue</span>
            </span>
          </div>
          <Link
            to="/admin/products"
            className="mt-4 text-xs font-medium text-amber-400/90 hover:text-amber-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Manage products</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Collections */}
        <div className="bg-stone-900/70 border border-stone-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-stone-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">Collections</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-100">
              {loading ? '...' : stats.totalCollections}
            </span>
            <span className="text-xs text-stone-400">Categories</span>
          </div>
          <Link
            to="/admin/collections"
            className="mt-4 text-xs font-medium text-blue-400/90 hover:text-blue-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Manage collections</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Featured Items */}
        <div className="bg-stone-900/70 border border-stone-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-stone-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">Featured Showcase</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-300">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-100">
              {loading ? '...' : stats.featuredCount}
            </span>
            <span className="text-xs text-stone-400">On Home Page</span>
          </div>
          <Link
            to="/admin/products"
            className="mt-4 text-xs font-medium text-amber-400/90 hover:text-amber-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View featured</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Studio Status */}
        <div className="bg-stone-900/70 border border-stone-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-stone-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">Published Status</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-100">100%</span>
            <span className="text-xs text-stone-400">Visible to Public</span>
          </div>
          <Link
            to="/admin/settings"
            className="mt-4 text-xs font-medium text-emerald-400/90 hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Site controls</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-stone-200 flex items-center gap-2">
          <Layers size={18} className="text-amber-400" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products"
            className="p-5 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-stone-700 hover:bg-stone-900 transition-all block group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Package size={18} />
              </span>
              <ArrowRight size={16} className="text-stone-500 group-hover:text-stone-300 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-medium text-stone-100 text-base">Product Catalogue</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Edit pricing, swap photos, toggle featured items, or add new handcrafted pieces.
            </p>
          </Link>

          <Link
            to="/admin/collections"
            className="p-5 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-stone-700 hover:bg-stone-900 transition-all block group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FolderKanban size={18} />
              </span>
              <ArrowRight size={16} className="text-stone-500 group-hover:text-stone-300 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-medium text-stone-100 text-base">Collections & Categories</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Reorder categories on the home page, change cover images, and update descriptions.
            </p>
          </Link>

          <Link
            to="/admin/settings"
            className="p-5 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-stone-700 hover:bg-stone-900 transition-all block group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Sliders size={18} />
              </span>
              <ArrowRight size={16} className="text-stone-500 group-hover:text-stone-300 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-medium text-stone-100 text-base">Website Content & Settings</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Update announcement bar banner, hero section text, FAQ answers, and contact info.
            </p>
          </Link>
        </div>
      </div>

      {/* Easy Help Card for Father */}
      <div className="bg-stone-900/40 border border-stone-800/80 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-100">Need help updating the website?</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed max-w-xl">
              We made a simple step-by-step guide explaining how to change prices, upload photos from your phone, and organize collections without any technical terms.
            </p>
          </div>
        </div>
        <Link to="/admin/help" className="shrink-0">
          <Button variant="outline" className="border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl h-10 px-4">
            Open Help Guide
          </Button>
        </Link>
      </div>
    </div>
  );
}
