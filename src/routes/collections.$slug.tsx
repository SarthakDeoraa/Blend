import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/blend/header";
import { SiteFooter } from "@/components/blend/footer";
import { Reveal } from "@/components/blend/reveal";
import { ProductCard } from "@/components/blend/product-card";
import { collections, getCollection, type Collection, type Product } from "@/data/collections";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const collection = getCollection(params.slug);
    if (!collection) throw notFound();
    return { collection };
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
  const { collection } = Route.useLoaderData() as { collection: Collection };
  const others = collections.filter((c) => c.slug !== collection.slug);

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
              {collection.count}
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
              <Reveal key={product.name} delay={index * 100}>
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