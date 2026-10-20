import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/blend/header";
import { SiteFooter } from "@/components/blend/footer";
import { Reveal } from "@/components/blend/reveal";
import { ProductCard } from "@/components/blend/product-card";
import {
  getCollection,
  type Collection,
  type Product,
} from "@/data/collections";
import { useSupabaseCollections } from "@/hooks/use-supabase-collections";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const local = getCollection(params.slug);
    const initialCollection: Collection = local ?? {
      slug: params.slug,
      name: params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      image: "",
      tagline: "",
      description: "",
      products: [],
    };
    return { initialCollection, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Collection not found — Blend" }, { name: "robots", content: "noindex" }],
      };
    }
    const { initialCollection } = loaderData;
    const title = `${initialCollection.name} — Blend Handcrafted Decor`;
    return {
      meta: [
        { title },
        { name: "description", content: initialCollection.description },
        { property: "og:title", content: title },
        { property: "og:description", content: initialCollection.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollectionPage,
});

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-3xl bg-secondary" />
      <div className="mt-5 space-y-2">
        <div className="h-4 w-3/4 rounded bg-stone-300/30" />
        <div className="h-3 w-1/2 rounded bg-stone-300/20" />
        <div className="h-5 w-1/3 rounded bg-stone-300/30" />
      </div>
    </div>
  );
}

function CollectionPage() {
  const { initialCollection, slug } = Route.useLoaderData() as {
    initialCollection: Collection;
    slug: string;
  };

  const { collections: liveCollections, loading } = useSupabaseCollections();

  const live = liveCollections.find((c) => c.slug === slug);
  const collection: Collection = live ?? initialCollection;
  const others = liveCollections.filter((c) => c.slug !== slug);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Collection Header Banner */}
        <section className="relative isolate overflow-hidden">
          {collection.image && (
            <img
              src={collection.image}
              alt={collection.name}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-primary/65 backdrop-blur-[2px]" />
          <div className="relative mx-auto max-w-7xl px-5 pt-40 pb-20 text-center md:px-8 md:pt-52 md:pb-28">
            <p className="text-[11px] tracking-[0.3em] text-primary-foreground/70 uppercase">
              {loading
                ? "Loading pieces…"
                : `${collection.products.length} ${
                    collection.products.length === 1 ? "piece" : "pieces"
                  }`}
            </p>
            <h1 className="mt-4 font-display text-4xl text-primary-foreground sm:text-5xl lg:text-6xl">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
                {collection.description}
              </p>
            )}
          </div>
        </section>

        {/* Collection Products Grid */}
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal className="mx-auto max-w-lg text-center">
            {collection.tagline && (
              <p className="text-[11px] tracking-[0.3em] text-accent uppercase">
                {collection.tagline}
              </p>
            )}
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">The pieces</h2>
          </Reveal>

          <div className="mt-14">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : collection.products.length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto">
                <p className="font-display text-2xl text-foreground">
                  No pieces currently in this collection
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Each piece is handcrafted and one-of-a-kind. Check back soon or request a custom
                  resin commission tailored to your space.
                </p>
                <div className="mt-8">
                  <Link
                    to="/collections"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-xs tracking-wider uppercase transition-colors hover:bg-secondary"
                  >
                    <ArrowLeft size={14} /> Browse all collections
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {collection.products.map((product: Product, index: number) => (
                  <Reveal key={product.name + index} delay={index * 60}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Other Collections Navigation */}
        {others.length > 0 && (
          <section className="border-t border-border/60">
            <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
              <Reveal className="text-center">
                <h2 className="font-display text-2xl sm:text-3xl">Continue browsing</h2>
              </Reveal>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {others.map((other) => (
                  <Link
                    key={other.slug}
                    to="/collections/$slug"
                    params={{ slug: other.slug }}
                    className="rounded-full border border-border px-5 py-3 text-[12px] tracking-[0.14em] uppercase transition-colors hover:bg-secondary"
                  >
                    {other.name}
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-[12px] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  <ArrowLeft size={14} strokeWidth={1.5} /> Back home
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}