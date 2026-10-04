import catWall from "@/assets/cat-wall.jpg";
import catTable from "@/assets/cat-table.jpg";
import catCoasters from "@/assets/cat-coasters.jpg";
import catCustom from "@/assets/cat-custom.jpg";
import catClocks from "@/assets/cat-clocks.jpg";
import catTrays from "@/assets/cat-trays.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

export type Product = {
  name: string;
  image: string;
  price: string;
  rating: number;
  reviews: number;
  badge?: string;
};

export type Collection = {
  slug: string;
  name: string;
  image: string;
  tagline: string;
  description: string;
  products: Product[];
};

/**
 * HOW TO ADD PRODUCTS
 * 1. Put the photo in src/assets/<collection>/<name>.jpg
 * 2. Import it at the top: import oceanPanel from "@/assets/wall-art/ocean.jpg";
 * 3. Add an entry to that collection's `products` array:
 *    { name: "Ocean Panel", image: oceanPanel, price: "₹18,400", rating: 5, reviews: 0, badge: "New" }
 * Piece counts update automatically. To add a new collection, copy a block below
 * with a unique `slug` — its page at /collections/<slug> is created automatically.
 */
export const collections: Collection[] = [
  {
    slug: "wall-art",
    name: "Wall Art",
    image: catWall,
    tagline: "Resin landscapes for empty walls",
    description:
      "Hand-poured resin panels set into reclaimed hardwood — each one a one-off study of pigment, grain and light.",
    products: [
      { name: "Ocean Drift Resin Panel", image: p2, price: "₹18,400", rating: 4.9, reviews: 74, badge: "Bestseller" },
      { name: "Monsoon Ridge Wall Study", image: p1, price: "₹14,900", rating: 4.8, reviews: 41 },
      { name: "Terra Fold Triptych", image: p4, price: "₹26,500", rating: 5.0, reviews: 22, badge: "New" },
      { name: "Sandstone Horizon Panel", image: p3, price: "₹11,200", rating: 4.7, reviews: 58 },
    ],
  },
  {
    slug: "clocks",
    name: "Clocks",
    image: catClocks,
    tagline: "Time, cast in stone and resin",
    description:
      "Silent-sweep movements housed in agate, olive wood and pigmented resin. Quiet objects that happen to tell time.",
    products: [
      { name: "Agate Geode Wall Clock", image: p2, price: "₹7,200", rating: 4.8, reviews: 94, badge: "Save 15%" },
      { name: "Olive Wood Arch Clock", image: p1, price: "₹5,600", rating: 4.9, reviews: 63 },
      { name: "Onyx Minimal Round Clock", image: p4, price: "₹6,400", rating: 4.7, reviews: 37 },
      { name: "Moss Resin Desk Clock", image: p3, price: "₹3,900", rating: 5.0, reviews: 51, badge: "New" },
    ],
  },
  {
    slug: "center-tables",
    name: "Center Tables",
    image: catTable,
    tagline: "The centre of the room, poured by hand",
    description:
      "River-line tables built from single wood slabs and deep-pour resin, finished with a matte hand-rubbed seal.",
    products: [
      { name: "River Line Coffee Table", image: p1, price: "₹68,000", rating: 5.0, reviews: 29, badge: "Bestseller" },
      { name: "Olive Slab Side Table", image: p3, price: "₹32,500", rating: 4.8, reviews: 44 },
      { name: "Onyx Pour Nesting Pair", image: p4, price: "₹54,000", rating: 4.9, reviews: 18 },
      { name: "Cloudbed Round Table", image: p2, price: "₹47,200", rating: 4.7, reviews: 25 },
    ],
  },
  {
    slug: "coasters",
    name: "Coasters",
    image: catCoasters,
    tagline: "Small pieces, same obsession",
    description:
      "Sets of four, cast in marble dust and resin. Heat-safe, felt-backed, and endlessly giftable.",
    products: [
      { name: "Moss Marble Coasters, Set of 4", image: p3, price: "₹1,950", rating: 5.0, reviews: 212, badge: "Bestseller" },
      { name: "Terracotta Swirl Coasters", image: p1, price: "₹1,750", rating: 4.8, reviews: 137 },
      { name: "Onyx Edge Coasters", image: p4, price: "₹2,200", rating: 4.9, reviews: 88 },
      { name: "Sea Glass Coasters", image: p2, price: "₹2,050", rating: 4.7, reviews: 64, badge: "New" },
    ],
  },
  {
    slug: "trays-and-boards",
    name: "Trays & Boards",
    image: catTrays,
    tagline: "Serve it on something worth keeping",
    description:
      "Food-safe boards and trays in olive wood and resin — built for grazing platters and the shelf afterwards.",
    products: [
      { name: "Olive River Serving Board", image: p1, price: "₹4,850", rating: 4.9, reviews: 128, badge: "Bestseller" },
      { name: "Charcoal Pour Bar Tray", image: p4, price: "₹5,400", rating: 4.8, reviews: 46 },
      { name: "Sand Dune Cheese Board", image: p3, price: "₹3,650", rating: 4.7, reviews: 72 },
      { name: "Tide Line Round Tray", image: p2, price: "₹4,200", rating: 5.0, reviews: 31 },
    ],
  },
  {
    slug: "custom-pieces",
    name: "Custom Pieces",
    image: catCustom,
    tagline: "Made with you, for one room only",
    description:
      "Share your space, palette and dimensions. Our studio designs, samples and pours a piece that exists only once.",
    products: [
      { name: "Bespoke Resin Wall Commission", image: p2, price: "From ₹22,000", rating: 5.0, reviews: 19, badge: "Studio" },
      { name: "Custom Slab Dining Table", image: p1, price: "From ₹95,000", rating: 5.0, reviews: 12 },
      { name: "Personalised Name Panel", image: p4, price: "From ₹8,500", rating: 4.9, reviews: 34 },
      { name: "Wedding Gift Set, Custom", image: p3, price: "From ₹6,900", rating: 4.8, reviews: 27 },
    ],
  },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);