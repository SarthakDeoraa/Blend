/**
 * Blend Studio - Supabase Database Seed Script
 *
 * Migrates hardcoded data from src/data/collections.ts into Supabase PostgreSQL.
 *
 * Usage:
 *   npx tsx supabase/seed.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Automatically load .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadLocalImage(localRelPath: string, destinationStoragePath: string): Promise<string> {
  try {
    const fullLocalPath = path.resolve(process.cwd(), 'src', localRelPath.replace(/^\//, ''));
    if (!fs.existsSync(fullLocalPath)) {
      console.warn(`   ⚠️ Local file not found: ${fullLocalPath}`);
      return localRelPath;
    }

    const fileBuffer = fs.readFileSync(fullLocalPath);
    const ext = path.extname(fullLocalPath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const { error } = await supabase.storage
      .from('images')
      .upload(destinationStoragePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`   ⚠️ Storage upload note for ${destinationStoragePath}:`, error.message);
      return localRelPath;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(destinationStoragePath);

    console.log(`   📸 Uploaded to Supabase Storage: ${destinationStoragePath}`);
    return publicUrl;
  } catch (err) {
    console.warn(`   ⚠️ Failed to upload image ${localRelPath}:`, err);
    return localRelPath;
  }
}

interface SeedCollection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image_url: string;
  sort_order: number;
  products: {
    name: string;
    description?: string;
    price_cents: number;
    price_type: 'fixed' | 'starting_from' | 'on_request';
    rating: number;
    review_count: number;
    badge: string | null;
    is_featured: boolean;
    availability: 'available' | 'sold' | 'made_to_order';
    image_url: string;
  }[];
}

const seedData: SeedCollection[] = [
  {
    slug: 'wall-art',
    name: 'Wall Art',
    tagline: 'Resin landscapes for empty walls',
    description: 'Hand-poured resin panels set into reclaimed hardwood — each one a one-off study of pigment, grain and light.',
    image_url: '/assets/cat-wall.jpg',
    sort_order: 1,
    products: [
      {
        name: 'Resin Car Garage Key Holder',
        description: 'Handcrafted resin wall-mount key holder with miniature vintage car accents and solid brass hooks.',
        price_cents: 350000,
        price_type: 'fixed',
        rating: 4.9,
        review_count: 74,
        badge: 'Bestseller',
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.07.26.jpeg',
      },
    ],
  },
  {
    slug: 'clocks',
    name: 'Clocks',
    tagline: 'Time, cast in stone and resin',
    description: 'Silent-sweep movements housed in agate, olive wood and pigmented resin. Quiet objects that happen to tell time.',
    image_url: '/assets/cat-clocks.jpg',
    sort_order: 2,
    products: [
      {
        name: 'Ocean Resin Half-Moon Knife Block',
        description: 'Magnetic walnut half-moon knife display with shimmering turquoise resin shorelines and strong neodymium hold.',
        price_cents: 1250000,
        price_type: 'fixed',
        rating: 4.8,
        review_count: 94,
        badge: 'Save 15%',
        is_featured: true,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.06.52 (1).jpeg',
      },
      {
        name: 'Blue Resin Burl Wood Knife Display',
        description: 'Sculptural burl wood block cast in deep oceanic blue resin with integrated magnetic strip.',
        price_cents: 1420000,
        price_type: 'fixed',
        rating: 4.9,
        review_count: 63,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.06.52.jpeg',
      },
      {
        name: 'Honeycomb Teal Resin Knife Stand',
        description: 'Geometric honeycomb structure stabilized with translucent teal epoxy resin.',
        price_cents: 1180000,
        price_type: 'fixed',
        rating: 4.7,
        review_count: 37,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.06.53 (2).jpeg',
      },
      {
        name: 'River Resin Knife Block with Base',
        description: 'Two live-edge slabs connected with an aquamarine resin river on a solid matte black base.',
        price_cents: 1350000,
        price_type: 'fixed',
        rating: 5.0,
        review_count: 51,
        badge: 'New',
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.06.53 (1).jpeg',
      },
      {
        name: 'Deep Blue Senken Damascus Knife Set',
        description: 'Complete culinary presentation with matching resin handle Damascus steel blades.',
        price_cents: 1890000,
        price_type: 'fixed',
        rating: 4.9,
        review_count: 42,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.06.53.jpeg',
      },
      {
        name: 'Honeycomb Amber Resin Knife Stand',
        description: 'Warm amber tones infused into natural honeycomb cells with magnetic blade retention.',
        price_cents: 1120000,
        price_type: 'fixed',
        rating: 4.8,
        review_count: 28,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.06.54.jpeg',
      },
    ],
  },
  {
    slug: 'center-tables',
    name: 'Center Tables',
    tagline: 'The centre of the room, poured by hand',
    description: 'River-line tables built from single wood slabs and deep-pour resin, finished with a matte hand-rubbed seal.',
    image_url: '/assets/cat-table.jpg',
    sort_order: 3,
    products: [
      {
        name: 'Olive Slab Resin Round Table',
        description: 'Aged olive wood rounds joined with crystalline sea-green resin and powder-coated steel hairpin legs.',
        price_cents: 6800000,
        price_type: 'fixed',
        rating: 5.0,
        review_count: 29,
        badge: 'Bestseller',
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.52 (1).jpeg',
      },
      {
        name: 'Ocean Blue Burl Resin Coffee Table',
        description: 'Rare wild burl slab flanked by layered gradient ocean waves, foam lacing and ultra-clear resin depth.',
        price_cents: 7250000,
        price_type: 'fixed',
        rating: 5.0,
        review_count: 44,
        badge: null,
        is_featured: true,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.52 (2).jpeg',
      },
      {
        name: 'Blue Wave Round Coffee Table',
        description: 'Circular accent table with dramatic 3-layer wave crests over golden Acacia wood.',
        price_cents: 6500000,
        price_type: 'fixed',
        rating: 4.9,
        review_count: 18,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.52.jpeg',
      },
      {
        name: 'Turquoise Wave Side Table',
        description: 'Compact round side table featuring turquoise waters spilling across natural bark edges.',
        price_cents: 3850000,
        price_type: 'fixed',
        rating: 4.9,
        review_count: 35,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.53 (1).jpeg',
      },
      {
        name: 'Aqua Ocean Side Table',
        description: 'Pristine aqua gradient with crushed quartz shoreline accents and satin oil finish.',
        price_cents: 4200000,
        price_type: 'fixed',
        rating: 4.7,
        review_count: 22,
        badge: 'New',
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.53 (2).jpeg',
      },
      {
        name: 'Beach Scene Resin Round Table',
        description: 'Detailed tropical coastal aerial view with real sand, shells and multi-layered breaking waves.',
        price_cents: 5800000,
        price_type: 'fixed',
        rating: 5.0,
        review_count: 31,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.53.jpeg',
      },
      {
        name: 'Clear Resin Driftwood Table',
        description: 'Sculptural coastal driftwood suspended in optic glass-clear epoxy resin block.',
        price_cents: 5400000,
        price_type: 'fixed',
        rating: 4.8,
        review_count: 19,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.54 (1).jpeg',
      },
      {
        name: 'Crimson Resin Round Side Table',
        description: 'Deep ruby crimson and volcanic pigment pour intersecting salvaged Indian teak.',
        price_cents: 4550000,
        price_type: 'fixed',
        rating: 4.9,
        review_count: 26,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.54 (2).jpeg',
      },
      {
        name: 'Jade Green Resin Coffee Table',
        description: 'Lush imperial jade swirl river running through heavy reclaimed suar timber.',
        price_cents: 4820000,
        price_type: 'fixed',
        rating: 5.0,
        review_count: 41,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.54.jpeg',
      },
      {
        name: 'Toy Car Resin Fun Table',
        description: 'Playful bespoke display table casting collectible miniature vehicles in glass epoxy.',
        price_cents: 3500000,
        price_type: 'fixed',
        rating: 4.7,
        review_count: 15,
        badge: 'Unique',
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.10.55.jpeg',
      },
      {
        name: 'Burlwood Clear Resin Table',
        description: 'Complex wood knots and organic voids preserved in crystal clear museum grade resin.',
        price_cents: 6200000,
        price_type: 'fixed',
        rating: 4.8,
        review_count: 33,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.11.45.jpeg',
      },
    ],
  },
  {
    slug: 'coasters',
    name: 'Coasters',
    tagline: 'Small pieces, same obsession',
    description: 'Sets of four, cast in marble dust and resin. Heat-safe, felt-backed, and endlessly giftable.',
    image_url: '/assets/cat-coasters.jpg',
    sort_order: 4,
    products: [
      {
        name: 'Folk Floral Nesting Trays, Set of 2',
        description: 'Hand-painted folk floral motifs sealed in polished food-safe clear resin with brass edge trim.',
        price_cents: 285000,
        price_type: 'fixed',
        rating: 5.0,
        review_count: 212,
        badge: 'Bestseller',
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.20.46 (1).jpeg',
      },
      {
        name: 'Festive Round Plates, Set of 2',
        description: 'Vibrant celebratory colors cast with botanical inclusions and heat-resistant finish.',
        price_cents: 195000,
        price_type: 'fixed',
        rating: 4.8,
        review_count: 137,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.20.46.jpeg',
      },
    ],
  },
  {
    slug: 'trays-and-boards',
    name: 'Trays & Boards',
    tagline: 'Serve it on something worth keeping',
    description: 'Food-safe boards and trays in olive wood and resin — built for grazing platters and the shelf afterwards.',
    image_url: '/assets/cat-trays.jpg',
    sort_order: 5,
    products: [
      {
        name: 'Whale Shape Ocean Resin Serving Board',
        description: 'Playful whale silhouette carved from Indian rosewood with ocean wave resin detail along the tail.',
        price_cents: 485000,
        price_type: 'fixed',
        rating: 4.9,
        review_count: 128,
        badge: 'Bestseller',
        is_featured: true,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 09.59.01 (1).jpeg',
      },
      {
        name: 'Navy Resin Wood Cutting Board',
        description: 'Ergonomic handle board with deep navy blue epoxy channel and juice groove.',
        price_cents: 320000,
        price_type: 'fixed',
        rating: 4.8,
        review_count: 46,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 09.59.01 (2).jpeg',
      },
      {
        name: 'Round Handle Resin Wood Board',
        description: 'Charcuterie presentation board with circular handle cutout and azure river pour.',
        price_cents: 365000,
        price_type: 'fixed',
        rating: 4.7,
        review_count: 72,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 09.59.01.jpeg',
      },
      {
        name: 'Ocean Blue Resin Chopping Board',
        description: 'Heavy butcher style serving board with dual pour ocean gradients.',
        price_cents: 540000,
        price_type: 'fixed',
        rating: 5.0,
        review_count: 31,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 09.59.02.jpeg',
      },
      {
        name: 'Smoky Resin Wood Tray with Handles',
        description: 'Smoky translucent resin with gold flakes and brushed antique bronze handles.',
        price_cents: 620000,
        price_type: 'fixed',
        rating: 4.9,
        review_count: 54,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.03.20 (1).jpeg',
      },
      {
        name: 'River Turquoise Resin Serving Tray',
        description: 'Signature river pour platter in warm teak wood with integrated side grips.',
        price_cents: 580000,
        price_type: 'fixed',
        rating: 4.8,
        review_count: 39,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.03.20 (2).jpeg',
      },
      {
        name: 'Ivory River Resin Serving Tray',
        description: 'Subtle mother-of-pearl ivory swirl on dark walnut timber.',
        price_cents: 550000,
        price_type: 'fixed',
        rating: 4.7,
        review_count: 47,
        badge: null,
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.03.20.jpeg',
      },
      {
        name: 'Round Ocean Resin Tray',
        description: 'Round breakfast tray with 3-dimensional swirling ocean currents and raised lip.',
        price_cents: 420000,
        price_type: 'fixed',
        rating: 5.0,
        review_count: 62,
        badge: 'New',
        is_featured: false,
        availability: 'available',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.03.21.jpeg',
      },
    ],
  },
  {
    slug: 'custom-pieces',
    name: 'Custom Pieces',
    tagline: 'Made with you, for one room only',
    description: 'Share your space, palette and dimensions. Our studio designs, samples and pours a piece that exists only once.',
    image_url: '/assets/cat-custom.jpg',
    sort_order: 6,
    products: [
      {
        name: 'Blue Resin Wood Tray, Silver Leaf Handles',
        description: 'Custom commissioned tray with silver leaf veins and polished nickel hardware.',
        price_cents: 850000,
        price_type: 'starting_from',
        rating: 5.0,
        review_count: 19,
        badge: 'Studio',
        is_featured: false,
        availability: 'made_to_order',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.04.57.jpeg',
      },
      {
        name: 'Rose Resin Round Serving Tray',
        description: 'Blush pink and rose gold metallic mica dust swirled through olive wood rounds.',
        price_cents: 720000,
        price_type: 'starting_from',
        rating: 5.0,
        review_count: 12,
        badge: null,
        is_featured: false,
        availability: 'made_to_order',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.06.05.jpeg',
      },
      {
        name: 'Floral Organizer Tray with Drawers',
        description: 'Botanical keepsake box with hand-cast dried blossom drawers and velvet lining.',
        price_cents: 650000,
        price_type: 'starting_from',
        rating: 4.9,
        review_count: 34,
        badge: 'New',
        is_featured: true,
        availability: 'made_to_order',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.17.08.jpeg',
      },
      {
        name: 'Floral Resin Serving Set, Rose Garden',
        description: 'Real preserved red rose petals suspended in optic glass resin with matching coasters.',
        price_cents: 980000,
        price_type: 'starting_from',
        rating: 4.8,
        review_count: 27,
        badge: null,
        is_featured: false,
        availability: 'made_to_order',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.19.13 (1).jpeg',
      },
      {
        name: 'Floral Resin Serving Set, Sunflower',
        description: 'Golden sunflower blossoms encapsulated forever in a brilliant high-clarity resin tray.',
        price_cents: 980000,
        price_type: 'starting_from',
        rating: 4.9,
        review_count: 21,
        badge: 'New',
        is_featured: false,
        availability: 'made_to_order',
        image_url: '/assets/Items/WhatsApp Image 2026-09-12 at 10.19.13.jpeg',
      },
    ],
  },
];

async function seed() {
  console.log('🌱 Starting Blend Studio database seed...');

  for (const colData of seedData) {
    // 1. Upload collection cover image to Supabase Storage
    const collectionImageUrl = await uploadLocalImage(
      colData.image_url,
      `collections/${colData.slug}.jpg`
    );

    // Insert or update collection
    const { data: col, error: colError } = await supabase
      .from('collections')
      .upsert(
        {
          slug: colData.slug,
          name: colData.name,
          tagline: colData.tagline,
          description: colData.description,
          image_url: collectionImageUrl,
          sort_order: colData.sort_order,
          status: 'published',
        },
        { onConflict: 'slug' }
      )
      .select('id, name')
      .single();

    if (colError || !col) {
      console.error(`❌ Failed to insert collection ${colData.name}:`, colError);
      continue;
    }

    console.log(`   ✓ Collection created (ID: ${col.id})`);

    // Insert products for this collection
    for (let i = 0; i < colData.products.length; i++) {
      const prod = colData.products[i];
      const sanitizedProdSlug = prod.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // 2. Upload product photo to Supabase Storage
      const prodImageUrl = await uploadLocalImage(
        prod.image_url,
        `products/${colData.slug}/${sanitizedProdSlug}.jpeg`
      );

      const { data: product, error: prodError } = await supabase
        .from('products')
        .insert({
          collection_id: col.id,
          name: prod.name,
          description: prod.description || '',
          price_cents: prod.price_cents,
          price_type: prod.price_type,
          rating: prod.rating,
          review_count: prod.review_count,
          badge: prod.badge,
          is_featured: prod.is_featured,
          sort_order: i + 1,
          status: 'published',
          availability: prod.availability,
        })
        .select('id, name')
        .single();

      if (prodError || !product) {
        console.error(`   ❌ Failed to insert product ${prod.name}:`, prodError);
        continue;
      }

      // Insert primary product image with live CDN URL
      await supabase.from('product_images').insert({
        product_id: product.id,
        image_url: prodImageUrl,
        sort_order: 1,
        is_primary: true,
      });

      console.log(`   ✓ Product inserted: "${prod.name}" (Price: ₹${prod.price_cents / 100})`);
    }
  }

  // Insert default site settings
  console.log('\n⚙️ Seeding default site settings...');
  const defaultSettings = [
    {
      key: 'announcement',
      value: {
        text: 'Handcrafted Resin & Wood Art — Bespoke Studio Commissions Open',
        link: '/collections/custom-pieces',
        active: true,
      },
    },
    {
      key: 'hero',
      value: {
        eyebrow: 'One-of-a-kind art & decor',
        title: 'Where resin meets raw timber.',
        description:
          'Blend crafts resin, wood and stone into modern art and functional decor for the home. Every piece is designed and hand-poured in our studio.',
        primaryButtonText: 'Explore Collections',
        primaryButtonLink: '/#collections',
        secondaryButtonText: 'Custom Pieces',
        secondaryButtonLink: '/collections/custom-pieces',
      },
    },
    {
      key: 'contact',
      value: {
        studioAddress: 'Blend Studio, Industrial Area, Phase II',
        email: 'hello@blenddecor.com',
        phone: '+91 98765 43210',
        instagram: '@blend.art.luxe',
      },
    },
  ];

  for (const setting of defaultSettings) {
    await supabase.from('site_settings').upsert(setting as any, { onConflict: 'key' });
    console.log(`   ✓ Setting saved: ${setting.key}`);
  }

  console.log('\n✨ Database seed completed successfully!');
}

seed().catch((err) => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
