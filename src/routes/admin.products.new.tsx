import React, { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Save,
  CheckCircle,
  Eye,
  Star,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatINR } from '@/lib/price';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/products/new')({
  head: () => ({
    meta: [
      { title: 'New Product — Blend Admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [collection, setCollection] = useState('wall-art');
  const [priceRupees, setPriceRupees] = useState('4500');
  const [priceType, setPriceType] = useState<'fixed' | 'starting_from' | 'on_request'>('fixed');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [availability, setAvailability] = useState<'available' | 'sold' | 'made_to_order'>('available');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [imageUrl, setImageUrl] = useState<string>('/assets/cat-table.jpg');
  const [submitting, setSubmitting] = useState(false);

  // Live preview calculations
  const priceCents = (parseFloat(priceRupees) || 0) * 100;
  const formattedPrice = formatINR(priceCents, priceType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured) {
      try {
        // Find collection id
        const { data: col } = await supabase
          .from('collections')
          .select('id')
          .eq('slug', collection)
          .single();

        if (col) {
          const { data: prod, error } = await supabase.from('products').insert({
            collection_id: col.id,
            name: name.trim(),
            description: description.trim(),
            price_cents: priceCents,
            price_type: priceType,
            badge: badge || null,
            is_featured: isFeatured,
            status: status,
            availability: availability,
            rating: 5.0,
            review_count: 0,
          }).select().single();

          if (error) throw error;

          if (prod && imageUrl) {
            await supabase.from('product_images').insert({
              product_id: prod.id,
              image_url: imageUrl,
              is_primary: true,
              sort_order: 1,
            });
          }
        }
      } catch (err) {
        console.error('Error saving product to Supabase:', err);
      }
    }

    toast.success(`"${name}" saved successfully!`);
    navigate({ to: '/admin/products' });
  };

  const handleImageUploadPlaceholder = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5 MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        toast.success('Photo uploaded for preview');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Back button & title */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white rounded-xl">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-stone-100">Add New Product</h1>
            <p className="text-xs text-stone-400 mt-0.5">Create a new resin or timber art piece</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button variant="outline" className="border-stone-800 bg-stone-900 text-stone-300 text-xs rounded-xl">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl text-xs flex items-center gap-2 px-5 h-10 shadow-lg shadow-amber-950/20"
          >
            <Save size={15} />
            <span>Save & Publish</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Main Info */}
          <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
              General Information
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="prodName" className="text-xs text-stone-300">
                Product Title <span className="text-amber-400">*</span>
              </Label>
              <Input
                id="prodName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ocean Drift Resin Table"
                required
                className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
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
                  <option value="wall-art">Wall Art</option>
                  <option value="clocks">Clocks & Stands</option>
                  <option value="center-tables">Center Tables</option>
                  <option value="coasters">Coasters</option>
                  <option value="trays-and-boards">Trays & Boards</option>
                  <option value="custom-pieces">Custom Pieces</option>
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
            <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
              Pricing Details (INR ₹)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="priceType" className="text-xs text-stone-300">
                  Price Presentation
                </Label>
                <select
                  id="priceType"
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as any)}
                  className="w-full h-11 px-3 bg-stone-950/70 border border-stone-800 text-stone-200 text-sm rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="fixed">Fixed Price (e.g. ₹18,400)</option>
                  <option value="starting_from">Starting From (e.g. From ₹8,500)</option>
                  <option value="on_request">Price on Request</option>
                </select>
              </div>

              {priceType !== 'on_request' && (
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs text-stone-300">
                    Amount in Rupees (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-serif">₹</span>
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      step="50"
                      value={priceRupees}
                      onChange={(e) => setPriceRupees(e.target.value)}
                      placeholder="18400"
                      className="pl-8 h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl font-mono text-base"
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-stone-400">
              Formatted display on public website: <span className="text-amber-300 font-mono font-medium">{formattedPrice}</span>
            </p>
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
                  Supports JPEG, PNG, or WebP up to 5 MB
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
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full h-11 px-3 bg-stone-950/70 border border-stone-800 text-stone-200 text-sm rounded-xl"
                >
                  <option value="available">Ready to Ship / Available</option>
                  <option value="made_to_order">Made to Order / Commission</option>
                  <option value="sold">Sold Out</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs text-stone-300">
                  Publish Status
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-11 px-3 bg-stone-950/70 border border-stone-800 text-stone-200 text-sm rounded-xl"
                >
                  <option value="published">Published (Visible immediately)</option>
                  <option value="draft">Draft (Hidden from public)</option>
                </select>
              </div>
            </div>

            {/* Featured Switch */}
            <div className="pt-2 flex items-center justify-between p-3.5 bg-stone-950/60 border border-stone-800/80 rounded-xl">
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-amber-400" />
                <div>
                  <p className="text-xs font-medium text-stone-200">Feature on Homepage</p>
                  <p className="text-[11px] text-stone-400">Include this piece in the Featured Curations carousel</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 rounded border-stone-700 text-amber-500 focus:ring-amber-500 bg-stone-900"
              />
            </div>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
              <Eye size={15} className="text-amber-400" />
              <span>Live Card Preview (Public Website)</span>
            </div>

            {/* Blend Product Card Preview */}
            <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-3xl shadow-2xl">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-stone-800">
                <img
                  src={imageUrl}
                  alt={name || 'Preview Product'}
                  className="h-full w-full object-cover"
                />
                {badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-medium tracking-wider text-amber-200 uppercase border border-amber-500/20">
                    {badge}
                  </span>
                )}
                {isFeatured && (
                  <span className="absolute right-3 top-3 rounded-full bg-amber-500/90 text-stone-950 p-1.5 shadow-md">
                    <Sparkles size={12} />
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-normal text-stone-100 truncate">
                    {name || 'Untitled Piece'}
                  </h3>
                  <p className="text-sm font-semibold text-amber-200 font-mono shrink-0 ml-2">
                    {formattedPrice}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-stone-400">
                  <span className="capitalize">{collection.replace('-', ' ')}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={12} fill="currentColor" />
                    <span className="font-mono text-stone-300">5.0</span>
                    <span className="text-stone-500">(New)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-900/40 border border-stone-800/80 rounded-2xl text-xs text-stone-400">
              <p className="font-medium text-stone-300 mb-1">Preview Note</p>
              <p className="text-[11px] leading-relaxed">
                This shows exactly how visitors will see this product on both desktop and mobile screens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
