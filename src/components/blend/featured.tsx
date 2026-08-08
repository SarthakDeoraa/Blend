import { Star, Plus } from "lucide-react";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import { Reveal } from "./reveal";

const products = [
  { name: "Olive River Serving Board", image: p1, price: "₹4,850", rating: 4.9, reviews: 128, badge: "Bestseller", tone: "accent" as const },
  { name: "Agate Geode Wall Clock", image: p2, price: "₹7,200", rating: 4.8, reviews: 94, badge: "Save 15%", tone: "olive" as const },
  { name: "Moss Marble Coasters, Set of 4", image: p3, price: "₹1,950", rating: 5.0, reviews: 212, badge: null, tone: "accent" as const },
  { name: "Onyx & Clay Bookend Pair", image: p4, price: "₹3,400", rating: 4.7, reviews: 61, badge: "New", tone: "olive" as const },
];

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

export function Featured() {
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
        {products.map((product, index) => (
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
                  <span
                    className={`absolute top-4 left-4 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase ${
                      product.tone === "accent"
                        ? "bg-accent text-accent-foreground"
                        : "bg-olive text-olive-foreground"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
                <div className="absolute inset-x-3 bottom-3 translate-y-[130%] transition-transform duration-500 ease-out group-hover:translate-y-0">
                  <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary/90 px-5 py-3.5 text-xs font-medium tracking-[0.14em] text-primary-foreground uppercase backdrop-blur-md transition-colors hover:bg-primary">
                    <Plus size={14} strokeWidth={2} />
                    Quick Add
                  </button>
                </div>
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