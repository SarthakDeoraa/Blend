import { Star } from "lucide-react";
import { Reveal } from "./reveal";
import { useFeaturedProducts } from "@/hooks/use-supabase-collections";

function Rating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={12}
          strokeWidth={1.5}
          className={i < Math.round(value) ? "fill-accent text-accent" : "text-border"}
        />
      ))}
    </span>
  );
}

function FeaturedSkeleton() {
  return (
    <article className="animate-pulse">
      <div className="aspect-square w-full rounded-3xl bg-stone-200/30" />
      <div className="mt-5 space-y-2">
        <div className="h-3 bg-stone-300/30 rounded w-3/4" />
        <div className="h-3 bg-stone-300/30 rounded w-1/3" />
        <div className="h-4 bg-stone-300/30 rounded w-1/4" />
      </div>
    </article>
  );
}

export function Featured() {
  const { products, loading } = useFeaturedProducts();

  return (
    <section id="collection" className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="text-[11px] tracking-[0.3em] text-accent uppercase">The Signature Blend</p>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl">
          Pieces our artisans are proud of
        </h2>
        <div className="mx-auto mt-7 flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-linear-to-r from-transparent to-border" />
          <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
          <span className="h-px w-16 bg-linear-to-l from-transparent to-border" />
        </div>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <FeaturedSkeleton key={i} />
            ))
          : products.map((product, index) => (
              <Reveal key={product.name} delay={index * 110}>
                <article className="group">
                  <div className="relative overflow-hidden rounded-3xl bg-secondary transition-shadow duration-700 hover:shadow-[var(--shadow-lift)]">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      width={900}
                      height={900}
                      className="aspect-square w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-105"
                    />
                    {product.badge && (
                      <span className="absolute top-4 left-4 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase bg-accent text-accent-foreground">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <h3 className="font-sans text-sm font-medium tracking-tight">{product.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <Rating value={product.rating} />
                      <span className="text-[11px] text-muted-foreground">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                    <p className="mt-2 font-display text-lg">{product.price}</p>
                  </div>
                </article>
              </Reveal>
            ))}
      </div>
    </section>
  );
}