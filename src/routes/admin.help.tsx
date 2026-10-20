import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  HelpCircle,
  PlusCircle,
  DollarSign,
  Smartphone,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/admin/help')({
  head: () => ({
    meta: [
      { title: 'Help & Instructions — Blend Admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminHelpPage,
});

function AdminHelpPage() {
  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-medium mb-2">
          <HelpCircle size={14} />
          <span>Easy Studio Guide</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-100">
          How to Manage Your Website
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Simple step-by-step instructions for adding photos, updating prices, and running the store.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Adding a Product */}
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <PlusCircle size={20} />
          </div>
          <h2 className="text-base font-semibold text-stone-100">1. Adding a New Product</h2>
          <ol className="text-xs text-stone-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Click the orange <strong>&ldquo;Add New Product&rdquo;</strong> button.</li>
            <li>Type the title of the piece (e.g. <em>Ocean Blue Table</em>).</li>
            <li>Select which category it belongs to (e.g. <em>Center Tables</em>).</li>
            <li>Type the price in Rupees (₹).</li>
            <li>Click <strong>&ldquo;Choose Photo&rdquo;</strong> to attach a picture from your phone or laptop.</li>
            <li>Click <strong>&ldquo;Save & Publish&rdquo;</strong>. It appears on your site immediately!</li>
          </ol>
        </div>

        {/* Card 2: Changing a Price */}
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <h2 className="text-base font-semibold text-stone-100">2. Changing Prices</h2>
          <ol className="text-xs text-stone-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Click <strong>&ldquo;Products&rdquo;</strong> in the left sidebar.</li>
            <li>Find the piece in the table (you can search by name).</li>
            <li>Click the <strong>&ldquo;Edit&rdquo;</strong> button next to it.</li>
            <li>Change the number in the price box.</li>
            <li>Click <strong>&ldquo;Save&rdquo;</strong>. The new price is live right away.</li>
          </ol>
        </div>

        {/* Card 3: Front page highlight */}
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <h2 className="text-base font-semibold text-stone-100">3. Featuring on Homepage</h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            To highlight a bestseller or unique artwork on your main front page:
          </p>
          <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Open the product in the editor.</li>
            <li>Turn ON the <strong>&ldquo;Feature on Homepage&rdquo;</strong> toggle switch.</li>
            <li>Click Save. It will now appear in the front page Featured Curations!</li>
          </ul>
        </div>

        {/* Card 4: Made a mistake? */}
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <RotateCcw size={20} />
          </div>
          <h2 className="text-base font-semibold text-stone-100">4. Made a Mistake? Undo!</h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            Don't worry — nothing is ever permanently deleted by accident!
          </p>
          <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>When you click delete, a black banner appears for 5 seconds with an <strong>&ldquo;Undo&rdquo;</strong> button.</li>
            <li>If you missed it, go to the <strong>&ldquo;Trash & Undo&rdquo;</strong> page in the menu.</li>
            <li>Click <strong>&ldquo;Restore to Site&rdquo;</strong> and your item comes back intact!</li>
          </ul>
        </div>
      </div>

      {/* Developer setup reference */}
      <div className="p-6 bg-stone-900/30 border border-stone-800 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-stone-300">
          <ShieldCheck size={18} className="text-amber-400" />
          <h3 className="text-sm font-semibold">Technical Setup Checklist (For Developer)</h3>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed">
          1. Run <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300">supabase/migrations/001_initial.sql</code> in the Supabase SQL Editor.<br />
          2. Run <code className="bg-stone-900 px-1 py-0.5 rounded">supabase/migrations/002_storage.sql</code> to create the storage bucket.<br />
          3. Run <code className="bg-stone-900 px-1 py-0.5 rounded">npx tsx supabase/seed.ts</code> to load initial data.<br />
          4. Create admin user in Supabase Authentication &gt; Users.
        </p>
      </div>
    </div>
  );
}
