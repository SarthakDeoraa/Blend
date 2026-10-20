import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Trash2, RotateCcw, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const [trashedItems, setTrashedItems] = useState<TrashedItem[]>([
    {
      id: 'sample-1',
      name: 'Archived Wave Board Sample',
      type: 'product',
      deleted_at: '2 days ago',
      price: '₹3,400',
    },
  ]);

  const handleRestore = (item: TrashedItem) => {
    setTrashedItems(trashedItems.filter((i) => i.id !== item.id));
    toast.success(`Restored "${item.name}" back to active catalogue!`);
  };

  const handlePermanentDelete = (item: TrashedItem) => {
    if (confirm(`Are you completely sure you want to permanently delete "${item.name}"? This cannot be undone.`)) {
      setTrashedItems(trashedItems.filter((i) => i.id !== item.id));
      toast.success(`"${item.name}" deleted permanently.`);
    }
  };

  const handleEmptyTrash = () => {
    if (confirm('Are you sure you want to empty the trash bin? All items will be permanently erased.')) {
      setTrashedItems([]);
      toast.success('Trash emptied.');
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

      {trashedItems.length === 0 ? (
        <div className="p-16 text-center bg-stone-900/40 border border-stone-800 rounded-3xl">
          <Trash2 size={40} className="mx-auto mb-3 text-stone-600" />
          <h3 className="text-base font-medium text-stone-200">The trash bin is empty</h3>
          <p className="text-xs text-stone-500 mt-1">
            Whenever you delete a product or category, it waits here safely so you can restore it anytime.
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
                      Deleted {item.deleted_at} &bull; {item.price || 'Category'}
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
