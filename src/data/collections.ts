import catWall from "@/assets/cat-wall.jpg";
import catTable from "@/assets/cat-table.jpg";
import catCoasters from "@/assets/cat-coasters.jpg";
import catCustom from "@/assets/cat-custom.jpg";
import catClocks from "@/assets/cat-clocks.jpg";
import catTrays from "@/assets/cat-trays.jpg";

export type Product = {
  id?: string;
  name: string;
  image: string;
  price: string;
  originalPrice?: string | null;
  discountPercent?: number;
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
 * Baseline collection categories and descriptions.
 * Live products and cover images are loaded dynamically from Supabase.
 */
export const collections: Collection[] = [
  {
    slug: "wall-art",
    name: "Wall Art",
    image: catWall,
    tagline: "Resin landscapes for empty walls",
    description:
      "Hand-poured resin panels set into reclaimed hardwood — each one a one-off study of pigment, grain and light.",
    products: [],
  },
  {
    slug: "clocks",
    name: "Clocks",
    image: catClocks,
    tagline: "Time, cast in stone and resin",
    description:
      "Silent-sweep movements housed in agate, olive wood and pigmented resin. Quiet objects that happen to tell time.",
    products: [],
  },
  {
    slug: "center-tables",
    name: "Center Tables",
    image: catTable,
    tagline: "The centre of the room, poured by hand",
    description:
      "River-line tables built from single wood slabs and deep-pour resin, finished with a matte hand-rubbed seal.",
    products: [],
  },
  {
    slug: "coasters",
    name: "Coasters",
    image: catCoasters,
    tagline: "Small pieces, same obsession",
    description:
      "Sets of four, cast in marble dust and resin. Heat-safe, felt-backed, and endlessly giftable.",
    products: [],
  },
  {
    slug: "trays-and-boards",
    name: "Trays & Boards",
    image: catTrays,
    tagline: "Serve it on something worth keeping",
    description:
      "Food-safe boards and trays in olive wood and resin — built for grazing platters and the shelf afterwards.",
    products: [],
  },
  {
    slug: "custom-pieces",
    name: "Custom Pieces",
    image: catCustom,
    tagline: "Made with you, for one room only",
    description:
      "Share your space, palette and dimensions. Our studio designs, samples and pours a piece that exists only once.",
    products: [],
  },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
