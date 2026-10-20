import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Plus,
  Search,
  Filter,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { collections as localCollections } from "@/data/collections";
import { formatINR, centsToRupees, calculateDiscountedCents } from "@/lib/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/")({
  head: () => ({
    meta: [
      { title: "Products Catalogue — Blend Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProductsPage,
});

interface DisplayProduct {
  id: string;
  name: string;
  collection_name: string;
  collection_slug: string;
  price_cents: number;
  price_type: "fixed" | "starting_from" | "on_request";
  discount_percent?: number;
  image_url: string;
  badge: string | null;
  is_featured: boolean;
  status: "published" | "draft";
  rating: number;
  review_count: number;
}

function AdminProductsPage() {
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      if (!isSupabaseConfigured) {
        // Fallback to local hardcoded collections
        const allProds: DisplayProduct[] = [];
        localCollections.forEach((c) => {
          c.products.forEach((p, idx) => {
            const isFeat =
              p.name.includes("Whale") ||
              p.name.includes("Knife Block") ||
              p.name.includes("Ocean Blue Burl") ||
              p.name.includes("Floral Organizer");

            allProds.push({
              id: `${c.slug}-${idx}`,
              name: p.name,
              collection_name: c.name,
              collection_slug: c.slug,
              price_cents: 100000, // placeholder or parsed
              price_type: p.price.startsWith("From") ? "starting_from" : "fixed",
              image_url: p.image,
              badge: p.badge || null,
              is_featured: isFeat,
              status: "published",
              rating: p.rating,
              review_count: p.reviews,
            });
          });
        });
        setProducts(allProds);
        setLoading(false);
        return;
      }

      try {
        let prodRows: any[] = [];
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            id,
            name,
            price_cents,
            price_type,
            discount_percent,
            badge,
            is_featured,
            status,
            rating,
            review_count,
            collections (
              name,
              slug
            ),
            product_images (
              image_url,
              is_primary
            )
          `,
          )
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (error) {
          const { data: fallbackData, error: fallbackErr } = await supabase
            .from("products")
            .select(
              `
              id,
              name,
              price_cents,
              price_type,
              badge,
              is_featured,
              status,
              rating,
              review_count,
              collections (
                name,
                slug
              ),
              product_images (
                image_url,
                is_primary
              )
            `,
            )
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

          if (fallbackErr) throw fallbackErr;
          prodRows = fallbackData || [];
        } else {
          prodRows = data || [];
        }

        const formatted: DisplayProduct[] = prodRows.map((p: any) => {
          const primaryImg =
            p.product_images?.find((img: any) => img.is_primary)?.image_url ||
            p.product_images?.[0]?.image_url ||
            "/placeholder.jpg";

          return {
            id: p.id,
            name: p.name,
            collection_name: p.collections?.name || "Unassigned",
            collection_slug: p.collections?.slug || "",
            price_cents: p.price_cents,
            price_type: p.price_type,
            discount_percent: p.discount_percent || 0,
            image_url: primaryImg,
            badge: p.badge,
            is_featured: p.is_featured,
            status: p.status,
            rating: p.rating,
            review_count: p.review_count,
          };
        });

        setProducts(formatted);
      } catch (err) {
        console.error("Error loading products from database:", err);
        toast.error("Failed to load products from database");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.collection_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCollection =
        selectedCollection === "all" || p.collection_slug === selectedCollection;

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesCollection && matchesStatus;
    });
  }, [products, searchQuery, selectedCollection, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    // Soft delete with 5-second undo toast
    const prev = [...products];
    setProducts(products.filter((p) => p.id !== id));

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("products")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      }

      toast(`Deleted "${name}"`, {
        description: "Item moved to Trash.",
        action: {
          label: "Undo",
          onClick: async () => {
            setProducts(prev);
            if (isSupabaseConfigured) {
              await supabase.from("products").update({ deleted_at: null }).eq("id", id);
            }
            toast.success(`Restored "${name}"`);
          },
        },
        duration: 5000,
      });
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Failed to delete product from database");
      setProducts(prev);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-100 tracking-tight">
            Product Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Manage your resin art inventory, prices, photos, and showcase status
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button className="h-11 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950/20">
            <Plus size={18} strokeWidth={2.5} />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title or material..."
            className="pl-10 h-10 bg-stone-950/60 border-stone-800 text-stone-100 placeholder:text-stone-500 rounded-xl"
          />
        </div>

        {/* Collection Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="h-10 px-3 bg-stone-950/60 border border-stone-800 text-stone-200 text-xs rounded-xl focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Collections</option>
            <option value="wall-art">Wall Art</option>
            <option value="clocks">Clocks & Stands</option>
            <option value="center-tables">Center Tables</option>
            <option value="coasters">Coasters</option>
            <option value="trays-and-boards">Trays & Boards</option>
            <option value="custom-pieces">Custom Pieces</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-stone-950/60 border border-stone-800 text-stone-200 text-xs rounded-xl focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block mb-3" />
            <p>Loading catalogue products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <Package size={36} className="mx-auto mb-3 text-stone-500" />
            <p className="text-base font-medium text-stone-300">No products match your search</p>
            <p className="text-xs text-stone-500 mt-1">
              Try clearing your filters or add a new piece
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-900/80 border-b border-stone-800 text-stone-400 font-medium">
                <tr>
                  <th className="py-3.5 px-4 w-14">Image</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Collection</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-900/60 transition-colors group">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0 border border-stone-800">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 font-medium text-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{product.name}</span>
                        {product.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Collection */}
                    <td className="py-3 px-4 text-stone-400">
                      <span className="bg-stone-800/60 px-2.5 py-1 rounded-lg border border-stone-800">
                        {product.collection_name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono">
                      {(product.discount_percent ?? 0) > 0 &&
                      product.price_type !== "on_request" ? (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-stone-100 font-semibold">
                              {formatINR(
                                calculateDiscountedCents(
                                  product.price_cents,
                                  product.discount_percent,
                                ),
                                product.price_type,
                              )}
                            </span>
                            <span className="text-stone-500 text-xs line-through decoration-stone-500">
                              {formatINR(product.price_cents, product.price_type)}
                            </span>
                          </div>
                          <span className="inline-block mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            {product.discount_percent}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-200 font-semibold">
                          {formatINR(product.price_cents, product.price_type)}
                        </span>
                      )}
                    </td>

                    {/* Featured */}
                    <td className="py-3 px-4">
                      {product.is_featured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Sparkles size={11} />
                          Featured
                        </span>
                      ) : (
                        <span className="text-stone-500 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                          product.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-stone-800 text-stone-400"
                        }`}
                      >
                        {product.status === "published" ? "Active" : "Draft"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to="/admin/products/new" search={{ id: product.id }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg text-xs"
                          >
                            <Edit size={13} className="mr-1 text-amber-400" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="h-8 px-2 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg"
                          title="Move to trash"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
