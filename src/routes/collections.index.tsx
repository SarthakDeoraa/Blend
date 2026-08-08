import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/blend/header";
import { SiteFooter } from "@/components/blend/footer";
import { Reveal } from "@/components/blend/reveal";
import { collections } from "@/data/collections";

const title = "All Collections — Blend Handcrafted Decor";
const description =
  "Browse every Blend collection: resin wall art, clocks, center tables, coasters, trays and made-to-order custom pieces.";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionsIndex,
});

function CollectionsIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 pt-36 pb-24 md:px-8 md:pt-44 md:pb-32">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-[11px] tracking-[0.3em] text-accent uppercase">Collections</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">Shop by form</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <Reveal key={collection.slug} delay={index * 90}>
              <Link
                to="/collections/$slug"
                params={{ slug: collection.slug }}
                className="group block overflow-hidden rounded-[32px] bg-secondary transition-shadow duration-700 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary/20 transition-colors duration-700 group-hover:bg-primary/45" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                    <p className="font-display text-2xl text-primary-foreground">{collection.name}</p>
                    <p className="mt-1 text-[11px] tracking-[0.2em] text-primary-foreground/75 uppercase">
                      {collection.count}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-6 py-5">
                  <p className="min-w-0 truncate text-sm text-muted-foreground">{collection.tagline}</p>
                  <ArrowRight size={16} strokeWidth={1.5} className="shrink-0 text-accent" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}