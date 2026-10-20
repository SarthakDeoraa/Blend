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
        {product.badge && (
          <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-accent-foreground uppercase">
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
  );
}