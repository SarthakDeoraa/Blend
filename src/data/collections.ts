import catWall from "@/assets/cat-wall.jpg";
import catTable from "@/assets/cat-table.jpg";
import catCoasters from "@/assets/cat-coasters.jpg";
import catCustom from "@/assets/cat-custom.jpg";
import catClocks from "@/assets/cat-clocks.jpg";
import catTrays from "@/assets/cat-trays.jpg";

// Wall Art items
import wallKeyHolder from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.07.26.jpeg";

// Clock items (reusing some distinctive pieces)
import clockKnifeBlock1 from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.06.52 (1).jpeg";
import clockKnifeDisplay from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.06.52.jpeg";
import clockHoneycomb1 from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.06.53 (2).jpeg";
import clockKnifeBlock2 from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.06.53 (1).jpeg";
import clockSenken from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.06.53.jpeg";
import clockHoneycomb2 from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.06.54.jpeg";

// Center Table items
import tableResinWood from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.52 (1).jpeg";
import tableOceanBlue from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.52 (2).jpeg";
import tableOceanRound from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.52.jpeg";
import tableTurquoiseWave from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.53 (1).jpeg";
import tableAquaOcean from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.53 (2).jpeg";
import tableBeachScene from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.53.jpeg";
import tableDriftwood from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.54 (1).jpeg";
import tableRedResin from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.54 (2).jpeg";
import tableGreenResin from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.54.jpeg";
import tableToyCar from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.10.55.jpeg";
import tableBurlwood from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.11.45.jpeg";

// Coaster / Tray items
import floralTrays from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.20.46 (1).jpeg";
import festivePlates from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.20.46.jpeg";

// Trays & Boards items
import boardWhale from "@/assets/Items/WhatsApp Image 2026-09-12 at 09.59.01 (1).jpeg";
import boardNavyHandle from "@/assets/Items/WhatsApp Image 2026-09-12 at 09.59.01 (2).jpeg";
import boardRoundHandle from "@/assets/Items/WhatsApp Image 2026-09-12 at 09.59.01.jpeg";
import boardOceanChopping from "@/assets/Items/WhatsApp Image 2026-09-12 at 09.59.02.jpeg";
import trayGreyYellow from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.03.20 (1).jpeg";
import trayRiverTurquoise from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.03.20 (2).jpeg";
import trayWhiteRiver from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.03.20.jpeg";
import trayRoundOcean from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.03.21.jpeg";

// Custom Pieces items
import customBlueLeaf from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.04.57.jpeg";
import customPinkRound from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.06.05.jpeg";
import customFloralOrganizer from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.17.08.jpeg";
import customFloralSetRed from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.19.13 (1).jpeg";
import customFloralSetYellow from "@/assets/Items/WhatsApp Image 2026-09-12 at 10.19.13.jpeg";

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
      { name: "Resin Car Garage Key Holder", image: wallKeyHolder, price: "₹3,500", rating: 4.9, reviews: 74, badge: "Bestseller" },
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
      { name: "Ocean Resin Half-Moon Knife Block", image: clockKnifeBlock1, price: "₹12,500", rating: 4.8, reviews: 94, badge: "Bestseller" },
      { name: "Blue Resin Burl Wood Knife Display", image: clockKnifeDisplay, price: "₹14,200", rating: 4.9, reviews: 63 },
      { name: "Honeycomb Teal Resin Knife Stand", image: clockHoneycomb1, price: "₹11,800", rating: 4.7, reviews: 37 },
      { name: "River Resin Knife Block with Base", image: clockKnifeBlock2, price: "₹13,500", rating: 5.0, reviews: 51, badge: "New" },
      { name: "Deep Blue Senken Damascus Knife Set", image: clockSenken, price: "₹18,900", rating: 4.9, reviews: 42 },
      { name: "Honeycomb Amber Resin Knife Stand", image: clockHoneycomb2, price: "₹11,200", rating: 4.8, reviews: 28 },
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
      { name: "Olive Slab Resin Round Table", image: tableResinWood, price: "₹68,000", rating: 5.0, reviews: 29, badge: "Bestseller" },
      { name: "Ocean Blue Burl Resin Coffee Table", image: tableOceanBlue, price: "₹72,500", rating: 4.8, reviews: 44 },
      { name: "Blue Wave Round Coffee Table", image: tableOceanRound, price: "₹65,000", rating: 4.9, reviews: 18 },
      { name: "Turquoise Wave Side Table", image: tableTurquoiseWave, price: "₹38,500", rating: 4.9, reviews: 35 },
      { name: "Aqua Ocean Side Table", image: tableAquaOcean, price: "₹42,000", rating: 4.7, reviews: 22, badge: "New" },
      { name: "Beach Scene Resin Round Table", image: tableBeachScene, price: "₹58,000", rating: 5.0, reviews: 31 },
      { name: "Clear Resin Driftwood Table", image: tableDriftwood, price: "₹54,000", rating: 4.8, reviews: 19 },
      { name: "Crimson Resin Round Side Table", image: tableRedResin, price: "₹45,500", rating: 4.9, reviews: 26 },
      { name: "Jade Green Resin Coffee Table", image: tableGreenResin, price: "₹48,200", rating: 5.0, reviews: 41 },
      { name: "Toy Car Resin Fun Table", image: tableToyCar, price: "₹35,000", rating: 4.7, reviews: 15, badge: "Unique" },
      { name: "Burlwood Clear Resin Table", image: tableBurlwood, price: "₹62,000", rating: 4.8, reviews: 33 },
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
      { name: "Folk Floral Nesting Trays, Set of 2", image: floralTrays, price: "₹2,850", rating: 5.0, reviews: 212, badge: "Bestseller" },
      { name: "Festive Round Plates, Set of 2", image: festivePlates, price: "₹1,950", rating: 4.8, reviews: 137 },
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
      { name: "Whale Shape Ocean Resin Serving Board", image: boardWhale, price: "₹4,850", rating: 4.9, reviews: 128, badge: "Bestseller" },
      { name: "Navy Resin Wood Cutting Board", image: boardNavyHandle, price: "₹3,200", rating: 4.8, reviews: 46 },
      { name: "Round Handle Resin Wood Board", image: boardRoundHandle, price: "₹3,650", rating: 4.7, reviews: 72 },
      { name: "Ocean Blue Resin Chopping Board", image: boardOceanChopping, price: "₹5,400", rating: 5.0, reviews: 31 },
      { name: "Smoky Resin Wood Tray with Handles", image: trayGreyYellow, price: "₹6,200", rating: 4.9, reviews: 54 },
      { name: "River Turquoise Resin Serving Tray", image: trayRiverTurquoise, price: "₹5,800", rating: 4.8, reviews: 39 },
      { name: "Ivory River Resin Serving Tray", image: trayWhiteRiver, price: "₹5,500", rating: 4.7, reviews: 47 },
      { name: "Round Ocean Resin Tray", image: trayRoundOcean, price: "₹4,200", rating: 5.0, reviews: 62, badge: "New" },
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
      { name: "Blue Resin Wood Tray, Silver Leaf Handles", image: customBlueLeaf, price: "From ₹8,500", rating: 5.0, reviews: 19, badge: "Studio" },
      { name: "Rose Resin Round Serving Tray", image: customPinkRound, price: "From ₹7,200", rating: 5.0, reviews: 12 },
      { name: "Floral Organizer Tray with Drawers", image: customFloralOrganizer, price: "From ₹6,500", rating: 4.9, reviews: 34 },
      { name: "Floral Resin Serving Set, Rose Garden", image: customFloralSetRed, price: "From ₹9,800", rating: 4.8, reviews: 27 },
      { name: "Floral Resin Serving Set, Sunflower", image: customFloralSetYellow, price: "From ₹9,800", rating: 4.9, reviews: 21, badge: "New" },
    ],
  },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);