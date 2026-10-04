import { createFileRoute } from "@tanstack/react-router";
import { CollectionsGrid } from "@/components/blend/collections-grid";
import { SiteHeader } from "@/components/blend/header";
import { SiteFooter } from "@/components/blend/footer";
import { Reveal } from "@/components/blend/reveal";

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

        <div className="mt-16">
          <CollectionsGrid />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}