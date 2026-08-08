import { useRef, useState } from "react";
import { Play, Heart } from "lucide-react";
import reel1 from "@/assets/reel1.jpg";
import reel2 from "@/assets/reel2.jpg";
import reel3 from "@/assets/reel3.jpg";
import reel4 from "@/assets/reel4.jpg";
import { Reveal } from "./reveal";

const reels = [
  { image: reel1, handle: "@ananya.home", quote: "It anchors the whole living room.", likes: "4.2k" },
  { image: reel2, handle: "@thebrewnest", quote: "Every guest asks about these.", likes: "2.8k" },
  { image: reel3, handle: "@studio.veda", quote: "The grain is unreal in person.", likes: "6.1k" },
  { image: reel4, handle: "@casa.mira", quote: "Our entryway finally feels done.", likes: "3.4k" },
];

export function Community() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const state = useRef({ startX: 0, startScroll: 0 });

  const onPointerDown = (event: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    setDragging(true);
    state.current = { startX: event.clientX, startScroll: track.scrollLeft };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track || !dragging) return;
    track.scrollLeft = state.current.startScroll - (event.clientX - state.current.startX);
  };

  return (
    <section id="community" className="overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-xl">
          <p className="text-[11px] tracking-[0.3em] text-accent uppercase">Community</p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl">
            Loved by homes across the country.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Drag to explore real spaces styled with Blend pieces.
          </p>
        </Reveal>
      </div>

      <Reveal
        delay={120}
        className="mt-12"
      >
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
          className={`no-scrollbar mx-auto flex w-fit max-w-full gap-5 overflow-x-auto px-5 pb-4 md:px-8 ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {reels.map((reel) => (
            <figure
              key={reel.handle}
              className="group relative aspect-[9/16] w-[240px] shrink-0 overflow-hidden rounded-[28px] bg-secondary shadow-[var(--shadow-soft)] transition-shadow duration-700 hover:shadow-[var(--shadow-lift)] sm:w-[280px]"
            >
              <img
                src={reel.image}
                alt={`Blend decor styled by ${reel.handle}`}
                loading="lazy"
                width={576}
                height={1024}
                draggable={false}
                className="h-full w-full object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/10 to-transparent" />
              <span className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-background/25 backdrop-blur-md">
                <Play size={14} strokeWidth={1.5} className="text-primary-foreground" />
              </span>
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-lg leading-snug text-primary-foreground">
                  “{reel.quote}”
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] tracking-[0.16em] text-primary-foreground/75 uppercase">
                  <span>{reel.handle}</span>
                  <span className="flex items-center gap-1">
                    <Heart size={11} strokeWidth={1.75} /> {reel.likes}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
          <div className="hidden w-2 shrink-0 md:block" />
        </div>
      </Reveal>
    </section>
  );
}