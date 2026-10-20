import { Star } from "lucide-react";
import type { Product } from "@/data/collections";

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

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-3xl bg-secondary transition-shadow duration-700 hover:shadow-[var(--shadow-lift)]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={900}
          height={900}
          className="aspect-square w-full object-cover object-center transition-transform duration-[1.1s] ease-out group-hover:scale-105"
        />
        {product.badge ? (
          <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-accent-foreground uppercase">
            {product.badge}
          </span>
        ) : product.discountPercent && product.discountPercent > 0 ? (
          <span className="absolute top-4 left-4 rounded-full bg-emerald-800/90 backdrop-blur-xs px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-white uppercase shadow-sm">
            {product.discountPercent}% OFF
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <h3 className="font-sans text-sm font-medium tracking-tight">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <Rating value={product.rating} />
          <span className="text-[11px] text-muted-foreground">
            {product.rating} ({product.reviews})
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <p className="font-display text-lg text-foreground">{product.price}</p>
          {product.originalPrice && (
            <p className="text-sm font-sans text-muted-foreground/75 line-through decoration-stone-400">
              {product.originalPrice}
            </p>
          )}
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
