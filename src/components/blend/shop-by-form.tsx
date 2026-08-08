import catWall from "@/assets/cat-wall.jpg";
import catTable from "@/assets/cat-table.jpg";
import catCoasters from "@/assets/cat-coasters.jpg";
import catCustom from "@/assets/cat-custom.jpg";
import { Reveal } from "./reveal";

const categories = [
  { name: "Wall Art", image: catWall, count: "38 pieces" },
  { name: "Center Tables", image: catTable, count: "12 pieces" },
  { name: "Coasters", image: catCoasters, count: "24 sets" },
  { name: "Custom Pieces", image: catCustom, count: "Made to order" },
  { name: "Trays & Boards", image: catWall, count: "19 pieces" },
];

export function ShopByForm() {
  return (
    <section id="forms" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-accent uppercase">Curated</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">Shop by Form</h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Browse by the shape your space is missing.
        </p>
      </Reveal>

      <Reveal delay={120} className="no-scrollbar -mx-5 mt-12 flex gap-4 overflow-x-auto px-5 md:mx-0 md:px-0">
        {categories.map((category) => (
          <a
            key={category.name}
            href="#collection"
            className="group relative h-[380px] w-[180px] shrink-0 overflow-hidden rounded-[100px] sm:h-[460px] sm:w-[220px]"
          >
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              width={640}
              height={1024}
              className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-primary/15 transition-colors duration-700 group-hover:bg-primary/55" />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-10 text-center">
              <p className="translate-y-3 font-display text-xl text-primary-foreground opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                {category.name}
              </p>
              <p className="mt-1 translate-y-4 text-[11px] tracking-[0.2em] text-primary-foreground/70 uppercase opacity-0 transition-all delay-75 duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                {category.count}
              </p>
            </div>
          </a>
        ))}
      </Reveal>
    </section>
  );
}