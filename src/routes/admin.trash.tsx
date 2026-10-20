import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Trash2, RotateCcw, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatINR } from '@/lib/price';

export const Route = createFileRoute('/admin/trash')({
  head: () => ({
    meta: [
      { title: 'Trash & Recycle Bin — Blend Admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminTrashPage,
});

interface TrashedItem {
  id: string;
  name: string;
  type: 'product' | 'collection';
  deleted_at: string;
  price?: string;
}

function AdminTrashPage() {
  const [trashedItems, setTrashedItems] = useState<TrashedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price_cents, price_type, deleted_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;

      const formatted: TrashedItem[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        type: 'product',
        deleted_at: p.deleted_at ? new Date(p.deleted_at).toLocaleDateString() : 'Recently',
        price: formatINR(p.price_cents, p.price_type),
      }));

      setTrashedItems(formatted);
    } catch (err) {
      console.error('Failed to load trash from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (item: TrashedItem) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('products')
          .update({ deleted_at: null })
          .eq('id', item.id);

        if (error) throw error;
      }

      setTrashedItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`Restored "${item.name}" back to active catalogue!`);
    } catch (err) {
      console.error('Failed to restore item:', err);
      toast.error('Failed to restore item');
    }
  };

  const handlePermanentDelete = async (item: TrashedItem) => {
    if (!confirm(`Are you completely sure you want to permanently delete "${item.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      if (isSupabaseConfigured) {
        // Also remove associated images
        await supabase.from('product_images').delete().eq('product_id', item.id);
        const { error } = await supabase.from('products').delete().eq('id', item.id);
        if (error) throw error;
      }

      setTrashedItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`"${item.name}" deleted permanently.`);
    } catch (err) {
      console.error('Failed to permanently delete item:', err);
      toast.error('Failed to delete item');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Are you sure you want to empty the trash bin? All items will be permanently erased.')) {
      return;
    }

    try {
      if (isSupabaseConfigured && trashedItems.length > 0) {
        const ids = trashedItems.map((i) => i.id);
        await supabase.from('product_images').delete().in('product_id', ids);
        const { error } = await supabase.from('products').delete().in('id', ids);
        if (error) throw error;
      }

      setTrashedItems([]);
      toast.success('Trash emptied.');
    } catch (err) {
      console.error('Failed to empty trash:', err);
      toast.error('Failed to empty trash');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-100">Trash & Undo Bin</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Safely recover deleted products or remove items permanently
          </p>
        </div>

        {trashedItems.length > 0 && (
          <Button
            variant="outline"
            onClick={handleEmptyTrash}
            className="text-xs border-red-900/40 bg-red-950/20 text-red-300 hover:bg-red-900/40 rounded-xl"
          >
            <Trash2 size={14} className="mr-1.5" />
            Empty Trash
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-stone-400 text-sm">
          <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block mb-3" />
          <p>Loading trashed items…</p>
        </div>
      ) : trashedItems.length === 0 ? (
        <div className="p-16 text-center bg-stone-900/40 border border-stone-800 rounded-3xl">
          <Trash2 size={40} className="mx-auto mb-3 text-stone-600" />
          <h3 className="text-base font-medium text-stone-200">The trash bin is empty</h3>
          <p className="text-xs text-stone-500 mt-1">
            Whenever you delete a product, it waits here safely so you can restore it anytime.
          </p>
        </div>
      ) : (
        <div className="bg-stone-900/60 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 bg-amber-950/30 border-b border-stone-800 text-xs text-amber-200 flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span>Items in trash are hidden from visitors on the public website.</span>
          </div>

          <div className="divide-y divide-stone-800/60">
            {trashedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-900/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 text-stone-400 flex items-center justify-center shrink-0">
                    <Package size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-stone-200">{item.name}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Deleted {item.deleted_at} &bull; {item.price || 'Item'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => handleRestore(item)}
                    size="sm"
                    className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>Restore to Site</span>
                  </Button>
                  <Button
                    onClick={() => handlePermanentDelete(item)}
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-stone-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl text-xs"
                  >
                    Delete Permanently
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
