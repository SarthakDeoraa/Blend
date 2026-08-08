import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/blend/header";
import { Hero } from "@/components/blend/hero";
import { ShopByForm } from "@/components/blend/shop-by-form";
import { Featured } from "@/components/blend/featured";
import { Community } from "@/components/blend/community";
import { Impact } from "@/components/blend/impact";
import { TrustAndFaq } from "@/components/blend/trust-faq";
import { SiteFooter, SupportBubble } from "@/components/blend/footer";

const title = "Blend — Handcrafted Resin & Wood Home Decor";
const description =
  "Where nature meets modern living. Blend crafts resin, wood and stone into one-of-a-kind wall art, tables and decor.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <ShopByForm />
        <Featured />
        <Community />
        <Impact />
        <TrustAndFaq />
      </main>
      <SiteFooter />
      <SupportBubble />
      <Toaster />
    </div>
  );
}
