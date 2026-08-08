import { useState } from "react";
import { ShieldCheck, Hammer, Leaf, Headphones, Plus } from "lucide-react";
import { Reveal } from "./reveal";

const signals = [
  { icon: ShieldCheck, title: "Secure Checkout", text: "Encrypted payments, always" },
  { icon: Hammer, title: "Artisan Crafted", text: "Hand-poured in small batches" },
  { icon: Leaf, title: "Carbon Neutral", text: "Offset shipping on every order" },
  { icon: Headphones, title: "24/7 Support", text: "Real humans, real answers" },
];

const faqs = [
  {
    q: "How long does a custom piece take?",
    a: "Custom commissions take 3–5 weeks. Resin cures slowly by design — we never rush a pour, and you'll receive studio photos at each stage.",
  },
  {
    q: "Is every piece one of a kind?",
    a: "Yes. Because we work with reclaimed timber and hand-mixed pigments, no two pieces share the same grain or flow pattern.",
  },
  {
    q: "How do I care for resin and wood decor?",
    a: "Wipe with a soft, damp cloth and keep out of prolonged direct sunlight. We include a natural wax balm with every large piece.",
  },
  {
    q: "What is your returns policy?",
    a: "Ready-to-ship pieces can be returned within 14 days in original packaging. Commissioned works are final sale.",
  },
];

export function TrustAndFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 border-y border-border py-12 md:grid-cols-4">
        {signals.map((signal, index) => (
          <Reveal key={signal.title} delay={index * 100} className="text-center md:text-left">
            <signal.icon size={24} strokeWidth={1.25} className="mx-auto text-olive md:mx-0" />
            <h3 className="mt-4 font-sans text-sm font-medium tracking-tight">{signal.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{signal.text}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-24 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <p className="text-[11px] tracking-[0.3em] text-accent uppercase">Questions</p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Good to know</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Everything about materials, timelines and care.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <ul>
            {faqs.map((faq, index) => {
              const isOpen = open === index;
              return (
                <li key={faq.q} className="border-b border-border first:border-t">
                  <button
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-lg sm:text-xl">{faq.q}</span>
                    <Plus
                      size={20}
                      strokeWidth={1.25}
                      className={`shrink-0 text-muted-foreground transition-transform duration-500 ${
                        isOpen ? "rotate-45 text-accent" : ""
                      }`}
                    />
                  </button>
                  <div
                    className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-xl pb-6 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}