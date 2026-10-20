import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";
import { useSupabaseCollections } from "@/hooks/use-supabase-collections";

/** Skeleton card shown while data loads */
function CollectionSkeleton() {
  return (
    <div className="rounded-[32px] bg-secondary overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-stone-200/30" />
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="h-3 bg-stone-300/30 rounded flex-1" />
        <div className="h-3 w-3 bg-stone-300/30 rounded" />
      </div>
    </div>
  );
}

export function CollectionsGrid() {
  const { collections, loading } = useSupabaseCollections();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CollectionSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  {collection.products.length}{" "}
                  {collection.products.length === 1 ? "piece" : "pieces"}
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
  );
}

export function CollectionsSection() {
  return (
    <section id="collections" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <Reveal className="mx-auto mb-14 max-w-xl text-center">
        <p className="text-[11px] tracking-[0.3em] text-accent uppercase">Collections</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">Explore the collections</h2>
      </Reveal>
      <CollectionsGrid />
    </section>
  );
}
