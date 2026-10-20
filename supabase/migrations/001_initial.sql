-- ══════════════════════════════════════════════════════════════════════
-- BLEND ART LUXE - DATABASE SCHEMA MIGRATION 001
-- ══════════════════════════════════════════════════════════════════════

-- Enable pgcrypto for UUIDs (available by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────
-- 1. COLLECTIONS TABLE
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  tagline       TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  image_url     TEXT,                                  -- CDN URL for category image
  sort_order    INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft'          -- 'draft' | 'published'
                CHECK (status IN ('draft', 'published')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ                            -- soft delete
);

-- ──────────────────────────────────────────────────────────────────────
-- 2. PRODUCTS TABLE
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id   UUID NOT NULL REFERENCES collections(id) ON DELETE RESTRICT,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  price_cents     INTEGER NOT NULL                     -- price in paise (₹72,500 = 7250000)
                  CHECK (price_cents > 0 AND price_cents <= 100000000), -- max ₹10,00,000
  price_type      TEXT NOT NULL DEFAULT 'fixed'        -- 'fixed' | 'starting_from' | 'on_request'
                  CHECK (price_type IN ('fixed', 'starting_from', 'on_request')),
  rating          NUMERIC(2,1) NOT NULL DEFAULT 5.0
                  CHECK (rating >= 1.0 AND rating <= 5.0),
  review_count    INTEGER NOT NULL DEFAULT 0
                  CHECK (review_count >= 0),
  badge           TEXT,                                -- 'Bestseller' | 'New' | 'Unique' | 'Studio' | null
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published')),
  availability    TEXT NOT NULL DEFAULT 'available'
                  CHECK (availability IN ('available', 'sold', 'made_to_order')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ                          -- soft delete
);

-- ──────────────────────────────────────────────────────────────────────
-- 3. PRODUCT IMAGES TABLE (multiple per product)
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,                         -- Supabase Storage CDN URL
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_primary    BOOLEAN NOT NULL DEFAULT false,        -- main display image
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- 4. SITE SETTINGS TABLE (hero, announcements, impact, faqs, reels)
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- 5. AUDIT LOG TABLE
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID,                                   -- auth.uid()
  admin_email TEXT,
  action      TEXT NOT NULL,                           -- 'create' | 'update' | 'delete' | 'restore' | 'login'
  entity_type TEXT NOT NULL,                           -- 'product' | 'collection' | 'image' | 'settings' | 'auth'
  entity_id   TEXT,
  old_data    JSONB,                                   -- snapshot before change
  new_data    JSONB,                                   -- snapshot after change
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- 6. INDEXES
-- ──────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_product
  ON product_images (product_id) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_products_collection
  ON products(collection_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products(is_featured) WHERE deleted_at IS NULL AND status = 'published';

CREATE INDEX IF NOT EXISTS idx_collections_status
  ON collections(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON audit_log(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_product_images_product
  ON product_images(product_id, sort_order);

-- ──────────────────────────────────────────────────────────────────────
-- 7. UPDATED_AT TRIGGER FUNCTION
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_collections_updated_at ON collections;
CREATE TRIGGER trigger_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON site_settings;
CREATE TRIGGER trigger_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ──────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 8.1 COLLECTIONS RLS
-- Anonymous public users can only see published, non-deleted collections
DROP POLICY IF EXISTS "Public can read published collections" ON collections;
CREATE POLICY "Public can read published collections"
  ON collections FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);

-- Authenticated admins have full management permissions
DROP POLICY IF EXISTS "Admins have full access to collections" ON collections;
CREATE POLICY "Admins have full access to collections"
  ON collections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8.2 PRODUCTS RLS
-- Anonymous public users can only see published, non-deleted products
DROP POLICY IF EXISTS "Public can read published products" ON products;
CREATE POLICY "Public can read published products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);

-- Authenticated admins have full management permissions
DROP POLICY IF EXISTS "Admins have full access to products" ON products;
CREATE POLICY "Admins have full access to products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8.3 PRODUCT IMAGES RLS
-- Public can see images of published, non-deleted products
DROP POLICY IF EXISTS "Public can read images of published products" ON product_images;
CREATE POLICY "Public can read images of published products"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id
        AND p.status = 'published'
        AND p.deleted_at IS NULL
    )
  );

-- Authenticated admins have full management permissions
DROP POLICY IF EXISTS "Admins have full access to product images" ON product_images;
CREATE POLICY "Admins have full access to product images"
  ON product_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8.4 SITE SETTINGS RLS
-- Public site needs to read settings
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated admins can insert/update settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8.5 AUDIT LOG RLS
-- Only authenticated users can view and write audit logs
DROP POLICY IF EXISTS "Admins can read audit log" ON audit_log;
CREATE POLICY "Admins can read audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert audit log" ON audit_log;
CREATE POLICY "Admins can insert audit log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);
