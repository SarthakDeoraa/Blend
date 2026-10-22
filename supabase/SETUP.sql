-- BLEND ART LUXE — COMPLETE SUPABASE SETUP
-- Run this entire file once in Supabase Dashboard → SQL Editor → New query.
-- It is safe to run again: existing tables, indexes, bucket, and policies are
-- retained or updated in place.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents > 0 AND price_cents <= 100000000),
  price_type TEXT NOT NULL DEFAULT 'fixed'
    CHECK (price_type IN ('fixed', 'starting_from', 'on_request')),
  discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0 CHECK (rating BETWEEN 1.0 AND 5.0),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  badge TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  availability TEXT NOT NULL DEFAULT 'available'
    CHECK (availability IN ('available', 'sold', 'made_to_order')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects created with older versions may have products without this column.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER NOT NULL DEFAULT 0
  CHECK (discount_percent BETWEEN 0 AND 100);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_product
  ON public.product_images (product_id) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_products_collection
  ON public.products (collection_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON public.products (is_featured) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_collections_status
  ON public.collections (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON public.audit_log (entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_collections_updated_at ON public.collections;
CREATE TRIGGER trigger_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trigger_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for both collection covers and product photography.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable Row-Level Security before adding policies.
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Remove the prior policy names so this script is fully repeatable.
DROP POLICY IF EXISTS "Public can read published collections" ON public.collections;
DROP POLICY IF EXISTS "Authenticated users can manage collections" ON public.collections;
DROP POLICY IF EXISTS "Admins have full access to collections" ON public.collections;
DROP POLICY IF EXISTS "Public can read published products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
DROP POLICY IF EXISTS "Public can read images of published products" ON public.product_images;
DROP POLICY IF EXISTS "Authenticated users can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins have full access to product images" ON public.product_images;
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can read audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated users can insert audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can read audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can insert audit log" ON public.audit_log;

CREATE POLICY "Public can read published collections"
  ON public.collections FOR SELECT TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Authenticated users can manage collections"
  ON public.collections FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can read published products"
  ON public.products FOR SELECT TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Authenticated users can manage products"
  ON public.products FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can read images of published products"
  ON public.product_images FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
        AND products.status = 'published'
        AND products.deleted_at IS NULL
    )
  );
CREATE POLICY "Authenticated users can manage product images"
  ON public.product_images FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "Authenticated users can manage site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Authenticated users can insert audit log"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (true);

-- Storage policies. A user must be signed in via Supabase Auth; the public
-- anon key can only read public images, never upload or modify them.
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update site images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload site images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] IN ('collections', 'products')
  );
CREATE POLICY "Authenticated users can update site images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');
CREATE POLICY "Authenticated users can delete site images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'images');
