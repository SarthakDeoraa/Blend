import React, { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  FolderKanban,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  GripVertical,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { collections as localCollections } from '@/data/collections';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/collections/')({
  head: () => ({
    meta: [
      { title: 'Collections — Blend Admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminCollectionsPage,
});

interface DisplayCollection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image_url: string;
  product_count: number;
  status: 'published' | 'draft';
}

function AdminCollectionsPage() {
  const [collections, setCollections] = useState<DisplayCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      setLoading(true);
      if (!isSupabaseConfigured) {
        setCollections(
          localCollections.map((c) => ({
            id: c.slug,
            slug: c.slug,
            name: c.name,
            tagline: c.tagline,
            description: c.description,
            image_url: c.image,
            product_count: c.products.length,
            status: 'published',
          }))
        );
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('collections')
          .select(`
            id,
            slug,
            name,
            tagline,
            description,
            image_url,
            status,
            products (id, deleted_at)
          `)
          .is('deleted_at', null)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        setCollections(
          (data || []).map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            tagline: c.tagline,
            description: c.description,
            image_url: c.image_url || '/assets/cat-table.jpg',
            product_count: c.products?.filter((p: any) => !p.deleted_at).length || 0,
            status: c.status,
          }))
        );
      } catch (err) {
        console.error('Error loading collections:', err);
        toast.error('Failed to load collections from database');
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, []);

  const handleDelete = (name: string) => {
    toast(`Category "${name}" selected`, {
      description: 'Categories with existing products cannot be deleted directly.',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-100 tracking-tight">
            Collections & Categories
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Organize the showcase categories shown on your homepage and navigation
          </p>
        </div>

        <Link to="/admin/collections/new">
          <Button className="h-11 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950/20">
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Collection</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {collections.map((col, idx) => (
          <div
            key={col.slug}
            className="bg-stone-900/60 border border-stone-800 rounded-3xl overflow-hidden shadow-lg group hover:border-stone-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-800">
                <img
                  src={col.image_url}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <span className="absolute left-3 top-3 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-stone-800">
                  #{idx + 1} Priority
                </span>
                <span className="absolute right-3 top-3 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-[10px] font-medium text-emerald-400 border border-stone-800 flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  Published
                </span>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-normal text-stone-100">
                    {col.name}
                  </h3>
                  <span className="text-xs text-stone-400 flex items-center gap-1 bg-stone-800/80 px-2.5 py-1 rounded-lg">
                    <Package size={12} />
                    {col.product_count} items
                  </span>
                </div>

                <p className="text-xs text-stone-300 font-medium italic">
                  &ldquo;{col.tagline}&rdquo;
                </p>

                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-stone-800/60 bg-stone-900/40 flex items-center justify-between mt-3">
              <Link
                to="/collections/$slug"
                params={{ slug: col.slug }}
                target="_blank"
                className="text-xs text-stone-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
              >
                <span>View on site</span>
                <ExternalLink size={12} />
              </Link>

              <div className="flex items-center gap-2">
                <Link to="/admin/collections/new">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-stone-300 hover:text-white hover:bg-stone-800 text-xs rounded-lg"
                  >
                    <Edit size={13} className="mr-1 text-amber-400" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(col.name)}
                  className="h-8 px-2 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
