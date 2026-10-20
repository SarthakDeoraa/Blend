/**
 * useSupabaseCollections
 * ----------------------
 * Fetches collections + their products directly from Supabase.
 * Falls back to local hardcoded data ONLY if Supabase is unreachable.
 *
 * KEY FIX: Supabase/PostgREST does not support filtering nested relations
 * with .eq('products.status', ...) — those filters are silently ignored.
 * Instead we fetch products separately with proper filters, then join them.
 */

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  collections as localCollections,
  type Collection,
  type Product,
} from '@/data/collections';

export interface SupabaseProduct {
  id: string;
  name: string;
  collection_id: string;
  price_cents: number;
  price_type: 'fixed' | 'starting_from' | 'on_request';
  badge: string | null;
  is_featured: boolean;
  status: string;
  rating: number;
  review_count: number;
  sort_order: number;
  product_images: { image_url: string; is_primary: boolean }[];
}

export interface SupabaseCollection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cover_image_url: string;
  sort_order: number;
}

/** Build the display price string */
function buildPrice(p: SupabaseProduct): string {
  if (!p.price_cents || p.price_type === 'on_request') return 'Price on request';
  const prefix = p.price_type === 'starting_from' ? 'From ' : '';
  return `${prefix}₹${p.price_cents.toLocaleString('en-IN')}`;
}

/** Pick primary image URL */
function primaryImageUrl(p: SupabaseProduct): string {
  const img = p.product_images?.find((i) => i.is_primary) ?? p.product_images?.[0];
  return img?.image_url ?? '';
}

function toProduct(p: SupabaseProduct): Product {
  return {
    name: p.name,
    image: primaryImageUrl(p),
    price: buildPrice(p),
    rating: p.rating ?? 5.0,
    reviews: p.review_count ?? 0,
    ...(p.badge ? { badge: p.badge } : {}),
  } as Product;
}

interface UseCollectionsResult {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  fromSupabase: boolean;
}

export function useSupabaseCollections(): UseCollectionsResult {
  const [collections, setCollections] = useState<Collection[]>(localCollections);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [fromSupabase, setFromSupabase] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCollections(localCollections);
      setLoading(false);
      return;
    }

    async function fetchCollections() {
      try {
        // Step 1: Fetch all active collections
        const { data: colData, error: colErr } = await supabase
          .from('collections')
          .select('id, slug, name, tagline, description, cover_image_url, sort_order')
          .is('deleted_at', null)
          .order('sort_order', { ascending: true });

        if (colErr) throw colErr;
        if (!colData || colData.length === 0) {
          setCollections(localCollections);
          setLoading(false);
          return;
        }

        // Step 2: Fetch ONLY published, non-deleted products WITH their images
        // We filter properly here instead of relying on broken nested filters
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select(`
            id, name, collection_id, price_cents, price_type,
            badge, is_featured, status, rating, review_count, sort_order,
            product_images ( image_url, is_primary )
          `)
          .eq('status', 'published')
          .is('deleted_at', null)
          .order('sort_order', { ascending: true });

        if (prodErr) throw prodErr;

        const products = (prodData || []) as unknown as SupabaseProduct[];

        // Step 3: Group products by collection_id
        const productsByCollection: Record<string, SupabaseProduct[]> = {};
        for (const p of products) {
          if (!productsByCollection[p.collection_id]) {
            productsByCollection[p.collection_id] = [];
          }
          productsByCollection[p.collection_id]!.push(p);
        }

        // Step 4: Build the final Collection[] shape
        const mapped: Collection[] = (colData as unknown as SupabaseCollection[]).map((c) => ({
          slug: c.slug,
          name: c.name,
          image: c.cover_image_url,
          tagline: c.tagline,
          description: c.description,
          products: (productsByCollection[c.id] || []).map(toProduct),
        }));

        setCollections(mapped);
        setFromSupabase(true);
      } catch (err: unknown) {
        console.error('Supabase collections fetch failed, falling back to local data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCollections(localCollections);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  return { collections, loading, error, fromSupabase };
}

/** Returns only featured products from Supabase (or top 4 local fallback) */
export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const featured: Product[] = [];
      for (const col of localCollections) {
        for (const p of col.products) {
          if (featured.length >= 4) break;
          featured.push(p);
        }
        if (featured.length >= 4) break;
      }
      setProducts(featured);
      setLoading(false);
      return;
    }

    async function fetchFeatured() {
      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select(`
            id, name, price_cents, price_type, badge, rating, review_count,
            product_images ( image_url, is_primary )
          `)
          .eq('is_featured', true)
          .eq('status', 'published')
          .is('deleted_at', null)
          .order('sort_order', { ascending: true })
          .limit(4);

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          setProducts((data as unknown as SupabaseProduct[]).map(toProduct));
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return { products, loading };
}
