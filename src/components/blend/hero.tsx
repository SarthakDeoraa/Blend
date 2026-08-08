import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[92vh] w-full overflow-hidden">
      <img
        src={heroImage}
        alt="Handcrafted resin and walnut wall art in a warm minimal interior"
        width={1920}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-primary/70 via-primary/35 to-transparent" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pt-40 pb-20 md:justify-center md:px-8 md:pb-28">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
          <p className="text-[11px] tracking-[0.35em] text-primary-foreground/70 uppercase">
            Resin · Wood · Stone
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-primary-foreground sm:text-6xl lg:text-7xl">
            Where Nature Meets <em className="text-sand italic">Modern Living.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
            Each piece is poured, sanded and finished by hand — a quiet fusion of raw material and
            contemporary form, made to live with you for decades.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#collection"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
            >
              Explore the Collection
              <ArrowRight
                size={16}
                strokeWidth={1.75}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </a>
            <a
              href="#impact"
              className="link-underline text-sm tracking-wide text-primary-foreground/80"
            >
              Our craft story
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}