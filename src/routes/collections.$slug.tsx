import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/blend/header";
import { SiteFooter } from "@/components/blend/footer";
import { Reveal } from "@/components/blend/reveal";
import { ProductCard } from "@/components/blend/product-card";
import {
  getCollection,
  type Collection,
  type Product,
  collections as localCollections,
} from "@/data/collections";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    // Use local data for SSR / initial load — Supabase fetch happens client-side
    const collection = getCollection(params.slug);
    if (!collection) throw notFound();
    return { collection, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Collection not found — Blend" }, { name: "robots", content: "noindex" }],
      };
    }
    const { collection } = loaderData;
    const title = `${collection.name} — Blend Handcrafted Decor`;
    return {
      meta: [
        { title },
        { name: "description", content: collection.description },
        { property: "og:title", content: title },
        { property: "og:description", content: collection.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { collection: initialCollection, slug } = Route.useLoaderData() as {
    collection: Collection;
    slug: string;
  };

  const [collection, setCollection] = useState<Collection>(initialCollection);
  const [allCollections, setAllCollections] = useState<Collection[]>(localCollections);

  // Fetch live data from Supabase client-side
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function fetchLiveData() {
      try {
        const { data, error } = await supabase
          .from("collections")
          .select(`
            id, slug, name, tagline, description, cover_image_url, sort_order,
            products (
              id, name, price_cents, price_type, badge, is_featured, rating, review_count, sort_order,
              product_images ( image_url, is_primary )
            )
          `)
          .is("deleted_at", null)
          .eq("products.status", "published")
          .is("products.deleted_at", null)
          .order("sort_order", { ascending: true });

        if (error || !data) return;

        const mapped: Collection[] = data.map((c: any) => ({
          slug: c.slug,
          name: c.name,
          image: c.cover_image_url,
          tagline: c.tagline,
          description: c.description,
          products: (c.products || []).map((p: any): Product => {
            const primaryImg =
              p.product_images?.find((i: any) => i.is_primary) ?? p.product_images?.[0];
            const prefix = p.price_type === "starting_from" ? "From " : "";
            return {
              name: p.name,
              image: primaryImg?.image_url ?? "",
              price: `${prefix}₹${p.price_cents.toLocaleString("en-IN")}`,
              rating: p.rating ?? 5.0,
              reviews: p.review_count ?? 0,
              badge: p.badge ?? undefined,
            };
          }),
        }));

        setAllCollections(mapped);
        const live = mapped.find((c) => c.slug === slug);
        if (live) setCollection(live);
      } catch (err) {
        console.error("Failed to load live collection:", err);
      }
    }

    fetchLiveData();
  }, [slug]);

  const others = allCollections.filter((c) => c.slug !== collection.slug);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative isolate overflow-hidden">
          <img
            src={collection.image}
            alt={collection.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-primary/65" />
          <div className="relative mx-auto max-w-7xl px-5 pt-40 pb-20 text-center md:px-8 md:pt-52 md:pb-28">
            <p className="text-[11px] tracking-[0.3em] text-primary-foreground/70 uppercase">
              {collection.products.length} pieces
            </p>
            <h1 className="mt-4 font-display text-4xl text-primary-foreground sm:text-5xl lg:text-6xl">
              {collection.name}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
              {collection.description}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal className="mx-auto max-w-lg text-center">
            <p className="text-[11px] tracking-[0.3em] text-accent uppercase">{collection.tagline}</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">The pieces</h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {collection.products.map((product: Product, index: number) => (
              <Reveal key={product.name + index} delay={index * 100}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>

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
      </main>
      <SiteFooter />
    </div>
  );
}