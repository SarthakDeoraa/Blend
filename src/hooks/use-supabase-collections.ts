/**
 * useSupabaseCollections
 * ----------------------
 * Fetches collections + their products directly from Supabase.
 * Groups products cleanly into their respective collections by collection_id.
 * Falls back to local baseline categories ONLY if Supabase is unreachable.
 */

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { collections as localCollections, type Collection, type Product } from "@/data/collections";
import { formatPriceWithDiscount } from "@/lib/price";

export interface SupabaseProduct {
  id: string;
  name: string;
  collection_id: string;
  price_cents: number;
  price_type: "fixed" | "starting_from" | "on_request";
  discount_percent?: number | null;
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
  image_url: string;
  sort_order: number;
}

/** Pick primary image URL */
function primaryImageUrl(p: SupabaseProduct): string {
  const img = p.product_images?.find((i) => i.is_primary) ?? p.product_images?.[0];
  return img?.image_url ?? "";
}

function toProduct(p: SupabaseProduct): Product {
  const { displayPrice, originalPrice, discountPercent } = formatPriceWithDiscount(
    p.price_cents,
    p.discount_percent || 0,
    p.price_type,
  );

  return {
    id: p.id,
    name: p.name,
    image: primaryImageUrl(p),
    price: displayPrice,
    originalPrice,
    discountPercent,
    rating: p.rating ?? 5.0,
    reviews: p.review_count ?? 0,
    ...(p.badge ? { badge: p.badge } : {}),
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
        // Step 1: Fetch all active collections with their cover image_url
        const { data: colData, error: colErr } = await supabase
          .from("collections")
          .select("id, slug, name, tagline, description, image_url, sort_order")
          .is("deleted_at", null)
          .order("sort_order", { ascending: true });

        if (colErr) throw colErr;
        if (!colData || colData.length === 0) {
          setCollections(localCollections);
          setLoading(false);
          return;
        }

        // Step 2: Fetch published, non-deleted products WITH their product_images
        let prodData: any = null;
        const { data: firstTryData, error: firstTryErr } = await supabase
          .from("products")
          .select(
            `
            id, name, collection_id, price_cents, price_type, discount_percent,
            badge, is_featured, status, rating, review_count, sort_order,
            product_images ( image_url, is_primary )
          `,
          )
          .eq("status", "published")
          .is("deleted_at", null)
          .order("sort_order", { ascending: true });

        if (firstTryErr) {
          // If discount_percent column doesn't exist yet in Supabase, query without it
          const { data: fallbackData, error: fallbackErr } = await supabase
            .from("products")
            .select(
              `
              id, name, collection_id, price_cents, price_type,
              badge, is_featured, status, rating, review_count, sort_order,
              product_images ( image_url, is_primary )
            `,
            )
            .eq("status", "published")
            .is("deleted_at", null)
            .order("sort_order", { ascending: true });

          if (fallbackErr) throw fallbackErr;
          prodData = fallbackData;
        } else {
          prodData = firstTryData;
        }

        const products = (prodData || []) as unknown as SupabaseProduct[];

        // Step 3: Group products strictly by collection_id
        const productsByCollection: Record<string, SupabaseProduct[]> = {};
        for (const p of products) {
          if (!productsByCollection[p.collection_id]) {
            productsByCollection[p.collection_id] = [];
          }
          productsByCollection[p.collection_id]!.push(p);
        }

        // Step 4: Build the final Collection[] shape
        const mapped: Collection[] = (colData as unknown as SupabaseCollection[]).map((c) => {
          const fallbackCover = localCollections.find((lc) => lc.slug === c.slug)?.image;
          return {
            slug: c.slug,
            name: c.name,
            image: c.image_url || fallbackCover || "",
            tagline: c.tagline || "",
            description: c.description || "",
            products: (productsByCollection[c.id] || []).map(toProduct),
          };
        });

        setCollections(mapped);
        setFromSupabase(true);
      } catch (err: unknown) {
        console.error("Supabase collections fetch failed, falling back to local categories:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setCollections(localCollections);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  return { collections, loading, error, fromSupabase };
}

/** Returns featured products from Supabase (or fallback first 4 published) */
export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    async function fetchFeatured() {
      try {
        // Query featured products
        let featuredList: SupabaseProduct[] = [];
        const { data: featData, error: featErr } = await supabase
          .from("products")
          .select(
            `
            id, name, collection_id, price_cents, price_type, discount_percent, badge, rating, review_count,
            product_images ( image_url, is_primary )
          `,
          )
          .eq("is_featured", true)
          .eq("status", "published")
          .is("deleted_at", null)
          .order("sort_order", { ascending: true })
          .limit(4);

        if (featErr) {
          const { data: featFallback } = await supabase
            .from("products")
            .select(
              `
              id, name, collection_id, price_cents, price_type, badge, rating, review_count,
              product_images ( image_url, is_primary )
            `,
            )
            .eq("is_featured", true)
            .eq("status", "published")
            .is("deleted_at", null)
            .order("sort_order", { ascending: true })
            .limit(4);
          featuredList = (featFallback || []) as unknown as SupabaseProduct[];
        } else {
          featuredList = (featData || []) as unknown as SupabaseProduct[];
        }

        // If fewer than 4 featured, fill up with other published products
        if (featuredList.length < 4) {
          const existingIds = featuredList.map((p) => p.id);
          const { data: moreProds } = await supabase
            .from("products")
            .select(
              `
              id, name, collection_id, price_cents, price_type, discount_percent, badge, rating, review_count,
              product_images ( image_url, is_primary )
            `,
            )
            .eq("status", "published")
            .is("deleted_at", null)
            .order("sort_order", { ascending: true })
            .limit(4);

          if (moreProds) {
            for (const p of moreProds as unknown as SupabaseProduct[]) {
              if (featuredList.length >= 4) break;
              if (!existingIds.includes(p.id)) {
                featuredList.push(p);
              }
            }
          }
        }

        if (featuredList.length > 0) {
          setProducts(featuredList.map(toProduct));
        }
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return { products, loading };
}
