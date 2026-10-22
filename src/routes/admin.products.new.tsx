import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Save,
  CheckCircle,
  Eye,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatINR, calculateDiscountedCents } from "@/lib/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type {
  PriceType,
  ProductAvailability,
  ProductImageRow,
  ProductInsert,
  ProductStatus,
  ProductUpdate,
} from "@/lib/types/database";

interface CollectionOption {
  id: string;
  slug: string;
  name: string;
}

interface EditableProduct {
  name: string;
  description: string;
  price_cents: number;
  discount_percent?: number | null;
  price_type?: PriceType | null;
  badge?: string | null;
  is_featured?: boolean | null;
  availability?: ProductAvailability | null;
  status?: ProductStatus | null;
  collections?: { slug: string } | null;
  product_images?: Pick<ProductImageRow, "image_url" | "is_primary">[] | null;
}

const fallbackCollectionOptions: CollectionOption[] = [
  { id: "wall-art", slug: "wall-art", name: "Wall Art" },
  { id: "clocks", slug: "clocks", name: "Clocks & Stands" },
  { id: "center-tables", slug: "center-tables", name: "Center Tables" },
  { id: "coasters", slug: "coasters", name: "Coasters" },
  { id: "trays-and-boards", slug: "trays-and-boards", name: "Trays & Boards" },
  { id: "custom-pieces", slug: "custom-pieces", name: "Custom Pieces" },
];

export const Route = createFileRoute("/admin/products/new")({
  validateSearch: (search: Record<string, unknown>): { id?: string | undefined } => ({
    id: (search["id"] as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Product Editor — Blend Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const editId = search?.id;
  const isEditing = Boolean(editId);

  const [name, setName] = useState("");
  const [collection, setCollection] = useState("wall-art");
  const [priceRupees, setPriceRupees] = useState("4500");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [priceType, setPriceType] = useState<"fixed" | "starting_from" | "on_request">("fixed");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [availability, setAvailability] = useState<"available" | "sold" | "made_to_order">(
    "available",
  );
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [collectionOptions, setCollectionOptions] =
    useState<CollectionOption[]>(fallbackCollectionOptions);

  // Collections are managed in the admin, so load them rather than maintaining
  // a separate hard-coded list in the product editor.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function loadCollectionOptions() {
      try {
        const { data, error } = await supabase
          .from("collections")
          .select("id, slug, name")
          .is("deleted_at", null)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const options = data as CollectionOption[];
          setCollectionOptions(options);
          setCollection((current) =>
            options.some((option) => option.slug === current) ? current : options[0].slug,
          );
        }
      } catch (err) {
        console.error("Failed to load collection options:", err);
        toast.error("Could not load collections; showing default categories");
      }
    }

    loadCollectionOptions();
  }, []);

  // Load existing product if in edit mode
  useEffect(() => {
    if (!editId || !isSupabaseConfigured) return;

    async function loadProduct() {
      try {
        setLoadingData(true);
        let prodData: EditableProduct | null = null;
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            id, name, description, price_cents, price_type, discount_percent, badge, is_featured,
            availability, status, collection_id,
            collections ( slug ),
            product_images ( image_url, is_primary )
          `,
          )
          .eq("id", editId)
          .single();

        if (error) {
          const { data: fallbackData, error: fallbackErr } = await supabase
            .from("products")
            .select(
              `
              id, name, description, price_cents, price_type, badge, is_featured,
              availability, status, collection_id,
              collections ( slug ),
              product_images ( image_url, is_primary )
            `,
            )
            .eq("id", editId)
            .single();

          if (fallbackErr || !fallbackData) throw fallbackErr || error;
          prodData = fallbackData;
        } else {
          prodData = data;
        }

        if (!prodData) throw error;

        setName(prodData.name || "");
        setDescription(prodData.description || "");
        setPriceRupees(String((prodData.price_cents || 0) / 100));
        setDiscountPercent(String(prodData.discount_percent || 0));
        setPriceType(prodData.price_type || "fixed");
        setBadge(prodData.badge || "");
        setIsFeatured(Boolean(prodData.is_featured));
        setAvailability(prodData.availability || "available");
        setStatus(prodData.status || "published");
        if (prodData.collections?.slug) {
          setCollection(prodData.collections.slug);
        }
        const img =
          prodData.product_images?.find((image) => image.is_primary) ??
          prodData.product_images?.[0];
        if (img?.image_url) {
          setImageUrl(img.image_url);
        }
      } catch (err) {
        console.error("Failed to load product for editing:", err);
        toast.error("Could not load product details");
      } finally {
        setLoadingData(false);
      }
    }

    loadProduct();
  }, [editId]);

  // Live preview calculations
  const priceCents = (parseFloat(priceRupees) || 0) * 100;
  const numDiscount = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));
  const discountedPriceCents = calculateDiscountedCents(priceCents, numDiscount);
  const formattedPrice = formatINR(priceCents, priceType);
  const formattedDiscountedPrice = formatINR(discountedPriceCents, priceType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured) {
      try {
        // Find collection id by slug
        const { data: col } = await supabase
          .from("collections")
          .select("id")
          .eq("slug", collection)
          .single();

        if (!col) {
          toast.error("Selected collection not found in database");
          setSubmitting(false);
          return;
        }

        if (isEditing && editId) {
          // UPDATE existing product
          const updatePayload: ProductUpdate = {
            collection_id: col.id,
            name: name.trim(),
            description: description.trim(),
            price_cents: priceCents,
            price_type: priceType,
            discount_percent: numDiscount,
            badge: badge || null,
            is_featured: isFeatured,
            status: status,
            availability: availability,
            updated_at: new Date().toISOString(),
          };

          let { error: updateErr } = await supabase
            .from("products")
            .update(updatePayload)
            .eq("id", editId);

          if (
            updateErr &&
            (updateErr.code === "42703" || updateErr.message?.includes("discount_percent"))
          ) {
            delete updatePayload["discount_percent"];
            const retry = await supabase.from("products").update(updatePayload).eq("id", editId);
            updateErr = retry.error;
          }

          if (updateErr) throw updateErr;

          // Update image if available
          if (imageUrl) {
            const { data: existingImgs } = await supabase
              .from("product_images")
              .select("id")
              .eq("product_id", editId)
              .order("is_primary", { ascending: false })
              .limit(1);

            const primaryImg = existingImgs?.[0];
            if (primaryImg) {
              await supabase
                .from("product_images")
                .update({ image_url: imageUrl })
                .eq("id", primaryImg.id);
            } else {
              await supabase.from("product_images").insert({
                product_id: editId,
                image_url: imageUrl,
                is_primary: true,
                sort_order: 1,
              });
            }
          }

          toast.success(`"${name}" updated successfully!`);
          navigate({ to: "/admin/products" });
          return;
        }

        // INSERT new product
        const insertPayload: ProductInsert = {
          collection_id: col.id,
          name: name.trim(),
          description: description.trim(),
          price_cents: priceCents,
          price_type: priceType,
          discount_percent: numDiscount,
          badge: badge || null,
          is_featured: isFeatured,
          status: status,
          availability: availability,
          rating: 5.0,
          review_count: 0,
        };

        let { data: prod, error } = await supabase
          .from("products")
          .insert(insertPayload)
          .select()
          .single();

        if (error && (error.code === "42703" || error.message?.includes("discount_percent"))) {
          delete insertPayload["discount_percent"];
          const retry = await supabase.from("products").insert(insertPayload).select().single();
          prod = retry.data;
          error = retry.error;
        }

        if (error) throw error;

        if (prod && imageUrl) {
          await supabase.from("product_images").insert({
            product_id: prod.id,
            image_url: imageUrl,
            is_primary: true,
            sort_order: 1,
          });
        }

        toast.success(`"${name}" saved successfully!`);
        navigate({ to: "/admin/products" });
        return;
      } catch (err: unknown) {
        console.error("Error saving product to Supabase:", err);
        const msg = err instanceof Error ? err.message : "Database error";
        toast.error(`Save failed: ${msg}`);
      } finally {
        setSubmitting(false);
      }
    } else {
      toast.info(`"${name}" saved (Supabase not configured)`);
      navigate({ to: "/admin/products" });
    }
  };

  const handleImageUploadPlaceholder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10 MB limit");
      return;
    }

    // Show local preview immediately while uploading
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    if (!isSupabaseConfigured) {
      toast.success("Photo ready for preview");
      return;
    }

    try {
      toast.info("Uploading photo to storage…");
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadErr) throw uploadErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(path);

      setImageUrl(publicUrl);
      toast.success("Photo uploaded successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(`Upload error: ${msg}`);
    }
  };

  if (loadingData) {
    return (
      <div className="py-24 text-center text-stone-400 text-sm">
        <span className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block mb-3" />
        <p>Loading product details…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Back button & title */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button
              variant="ghost"
              size="icon"
              className="text-stone-400 hover:text-white rounded-xl"
            >
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-stone-100">
              {isEditing ? "Edit Piece" : "Add New Product"}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {isEditing
                ? "Update specifications, collection category, and pricing"
                : "Create a new resin or timber art piece"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button
              variant="outline"
              className="border-stone-800 bg-stone-900 text-stone-300 text-xs rounded-xl"
            >
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl text-xs flex items-center gap-2 px-5 h-10 shadow-lg shadow-amber-950/20"
          >
            <Save size={15} />
            <span>{isEditing ? "Save Changes" : "Save & Publish"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Main Info */}
          <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
              Essential Details
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-stone-300">
                Product Title <span className="text-amber-400">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cerulean Wave Resin Wall Panel"
                className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="collection" className="text-xs text-stone-300">
                  Collection / Category <span className="text-amber-400">*</span>
                </Label>
                <select
                  id="collection"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-950/70 border border-stone-800 text-stone-200 text-sm rounded-xl focus:outline-none focus:border-amber-500"
                >
                  {collectionOptions.map((option) => (
                    <option key={option.id} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="badge" className="text-xs text-stone-300">
                  Highlight Badge (Optional)
                </Label>
                <select
                  id="badge"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full h-11 px-3 bg-stone-950/70 border border-stone-800 text-stone-200 text-sm rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="">No Badge</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="New">New</option>
                  <option value="Unique">Unique</option>
                  <option value="Studio">Studio Special</option>
                  <option value="Save 15%">Save 15%</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs text-stone-300">
                Description & Craft Details
              </Label>
              <Textarea
                id="desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention the timber species, resin shades, dimensions, and finish..."
                className="bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl resize-none text-sm"
              />
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
                Pricing Details (INR ₹)
              </h2>
              {numDiscount > 0 && priceType !== "on_request" ? (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {numDiscount}% Discount Active
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="priceType" className="text-xs text-stone-300">
                  Price Presentation
                </Label>
                <select
                  id="priceType"
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as PriceType)}
                  className="w-full h-11 px-3 bg-stone-950/70 border border-stone-800 text-stone-200 text-sm rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="fixed">Fixed Price (e.g. ₹18,400)</option>
                  <option value="starting_from">Starting From (e.g. From ₹8,500)</option>
                  <option value="on_request">Price on Request</option>
                </select>
              </div>

              {priceType !== "on_request" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="price" className="text-xs text-stone-300">
                      Amount in Rupees (₹)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-serif">
                        ₹
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="1"
                        step="50"
                        value={priceRupees}
                        onChange={(e) => setPriceRupees(e.target.value)}
                        placeholder="5000"
                        className="pl-8 h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl font-mono text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="discountPercent" className="text-xs text-stone-300">
                        Discount Option (%)
                      </Label>
                      {numDiscount > 0 ? (
                        <span className="text-[11px] text-emerald-400 font-medium">
                          {numDiscount}% off
                        </span>
                      ) : null}
                    </div>
                    <div className="relative">
                      <Input
                        id="discountPercent"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        placeholder="0 (e.g. 15)"
                        className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl font-mono text-base pr-8"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">
                        %
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {priceType !== "on_request" ? (
              <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-stone-400">Formatted website display:</span>
                {numDiscount > 0 ? (
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-stone-100 font-mono font-bold text-base">
                      {formattedDiscountedPrice}
                    </span>
                    <span className="text-stone-500 font-mono line-through text-xs decoration-stone-500">
                      {formattedPrice}
                    </span>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      Save {formatINR(priceCents - discountedPriceCents, "fixed")} ({numDiscount}%
                      off)
                    </span>
                  </div>
                ) : (
                  <span className="text-amber-300 font-mono font-medium text-sm">
                    {formattedPrice}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-stone-400">
                Formatted display on public website:{" "}
                <span className="text-amber-300 font-mono font-medium">{formattedPrice}</span>
              </p>
            )}
          </div>

          {/* Photo Upload Zone */}
          <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
              Product Photography
            </h2>

            <div className="border-2 border-dashed border-stone-800 hover:border-amber-500/50 rounded-2xl p-6 text-center transition-colors bg-stone-950/40">
              <input
                type="file"
                id="photoUpload"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUploadPlaceholder}
                className="hidden"
              />
              <label htmlFor="photoUpload" className="cursor-pointer block">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-medium text-stone-200">
                  Click to choose a photo from your computer or phone
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Supports JPEG, PNG, or WebP up to 10 MB (stored in Supabase Storage)
                </p>
              </label>
            </div>
          </div>

          {/* Availability and Visibility */}
          <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
              Visibility & Availability
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="availability" className="text-xs text-stone-300">
                  Stock Status
                </Label>
                <select
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as ProductAvailability)}
                  className="w-full h-11 px-3 bg-stone-950/70 border border-stone-800 text-stone-200 text-sm rounded-xl"
                >
                  <option value="available">Ready to Ship / Available</option>
                  <option value="made_to_order">Made to Order (2-3 weeks)</option>
                  <option value="sold">Sold Out / Archive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs text-stone-300">
                  Publish Status
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className="w-full h-11 px-3 bg-stone-950/70 border border-stone-800 text-stone-200 text-sm rounded-xl"
                >
                  <option value="published">Published (Visible to Visitors)</option>
                  <option value="draft">Draft (Private in Studio)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between p-3.5 bg-stone-950/60 border border-stone-800/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-200">Feature on Homepage</p>
                  <p className="text-[11px] text-stone-400">
                    Display this piece in the curated showcase on the front page
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
              />
            </div>
          </div>
        </form>

        {/* Live Public Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
              <Eye size={14} className="text-amber-400" />
              <span>Visitor Card Preview</span>
            </div>

            <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-sm">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name || "Preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-stone-600">
                    <ImageIcon size={40} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No photo selected</p>
                  </div>
                )}
                {badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                    {badge}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-amber-400/80 font-mono">
                    {collection.replace(/-/g, " ")}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-stone-400">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span>5.0 (New)</span>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-medium text-stone-100">
                  {name || "Piece Title Preview"}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-stone-100 font-mono">
                      {numDiscount > 0 && priceType !== "on_request"
                        ? formattedDiscountedPrice
                        : formattedPrice}
                    </span>
                    {numDiscount > 0 && priceType !== "on_request" ? (
                      <span className="text-xs text-stone-500 line-through font-mono">
                        {formattedPrice}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {numDiscount > 0 && priceType !== "on_request" ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/25">
                        {numDiscount}% OFF
                      </span>
                    ) : null}
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                      {status === "published" ? "Active" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
