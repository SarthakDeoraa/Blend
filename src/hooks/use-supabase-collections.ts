/**
 * useSupabaseCollections
 * ----------------------
 * Fetches collections + their products from Supabase.
 * Falls back to local hardcoded data when Supabase is not configured
 * or an error occurs, so the site always renders something.
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
  price_cents: number;
  price_type: 'fixed' | 'starting_from' | 'on_request';
  badge: string | null;
  is_featured: boolean;
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
  products: SupabaseProduct[];
}

/** Convert a Supabase collection row into the local Collection shape */
function toLocalCollection(c: SupabaseCollection): Collection {
  return {
    slug: c.slug,
    name: c.name,
    image: c.cover_image_url,
    tagline: c.tagline,
    description: c.description,
    products: (c.products || []).map((p): Product => {
      const primaryImg = p.product_images?.find((i) => i.is_primary) ?? p.product_images?.[0];
      const prefix = p.price_type === 'starting_from' ? 'From ' : '';
      const priceStr = p.price_cents
        ? `${prefix}₹${p.price_cents.toLocaleString('en-IN')}`
        : 'Price on request';

      return {
        name: p.name,
        image: primaryImg?.image_url ?? '',
        price: priceStr,
        rating: p.rating ?? 5.0,
        reviews: p.review_count ?? 0,
        ...(p.badge ? { badge: p.badge } : {}),
      };
    }),
  };
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
        const { data, error: fetchError } = await supabase
          .from('collections')
          .select(`
            id, slug, name, tagline, description, cover_image_url, sort_order,
            products (
              id, name, price_cents, price_type, badge, is_featured, rating, review_count, sort_order,
              product_images ( image_url, is_primary )
            )
          `)
          .is('deleted_at', null)
          .eq('products.status', 'published')
          .is('products.deleted_at', null)
          .order('sort_order', { ascending: true });

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          const mapped = (data as unknown as SupabaseCollection[]).map(toLocalCollection);
          setCollections(mapped);
          setFromSupabase(true);
        } else {
          // DB is empty — fall back to local data
          setCollections(localCollections);
        }
      } catch (err: unknown) {
        console.error('Failed to load collections from Supabase, using local data:', err);
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
      // Pick the first 4 products from localCollections that have a badge
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
          const mapped = (data as unknown as SupabaseProduct[]).map((p): Product => {
            const primaryImg =
              p.product_images?.find((i) => i.is_primary) ?? p.product_images?.[0];
            const prefix = p.price_type === 'starting_from' ? 'From ' : '';
            return {
              name: p.name,
              image: primaryImg?.image_url ?? '',
              price: `${prefix}₹${p.price_cents.toLocaleString('en-IN')}`,
              rating: p.rating ?? 5.0,
              reviews: p.review_count ?? 0,
              ...(p.badge ? { badge: p.badge } : {}),
            } as Product;
          });
          setProducts(mapped);
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
