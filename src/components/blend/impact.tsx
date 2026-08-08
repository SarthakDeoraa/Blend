import { ArrowRight } from "lucide-react";
import impactImage from "@/assets/impact.jpg";
import { Reveal } from "./reveal";

export function Impact() {
  return (
    <section id="impact" className="bg-secondary/60 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <Reveal>
          <div className="overflow-hidden rounded-tl-[140px] rounded-tr-3xl rounded-br-[140px] rounded-bl-3xl">
            <img
              src={impactImage}
              alt="An artisan pouring olive resin over a walnut slab in a sunlit studio"
              loading="lazy"
              width={1200}
              height={1408}
              className="aspect-[4/5] w-full object-cover transition-transform duration-[1.4s] ease-out hover:scale-105"
            />
          </div>
        </Reveal>

        <Reveal delay={140}>
          <p className="text-[11px] tracking-[0.3em] text-olive uppercase">The Blend Impact</p>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Crafting a Better World.
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            For every piece of art you bring home, we provide a meal to an animal in need. Our
            studios run on reclaimed timber, low-VOC resins and zero-waste offcuts — because beauty
            should never cost the earth.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-8 sm:max-w-md">
            <div>
              <dt className="font-display text-3xl">86,400</dt>
              <dd className="mt-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                Meals provided
              </dd>
            </div>
            <div>
              <dt className="font-display text-3xl">100%</dt>
              <dd className="mt-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                Reclaimed timber
              </dd>
            </div>
          </dl>

          <a
            href="#faq"
            className="group mt-10 inline-flex items-center gap-2 text-sm tracking-wide text-foreground"
          >
            <span className="link-underline">Learn More</span>
            <ArrowRight
              size={15}
              strokeWidth={1.75}
              className="transition-transform duration-500 group-hover:translate-x-1.5"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}