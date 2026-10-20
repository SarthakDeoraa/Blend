-- ══════════════════════════════════════════════════════════════════════
-- BLEND ART LUXE - MIGRATION 003: ADD DISCOUNT PERCENT TO PRODUCTS
-- ══════════════════════════════════════════════════════════════════════

-- 1. Add discount_percent column to products table (0-100%)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0
CHECK (discount_percent >= 0 AND discount_percent <= 100);

-- 2. Optional: Add an index if querying discounted products
CREATE INDEX IF NOT EXISTS idx_products_discount
  ON products(discount_percent) WHERE discount_percent > 0;
