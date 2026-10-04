import { useState } from "react";
import { ArrowRight, Instagram, Facebook, Youtube } from "lucide-react";
import { toast } from "sonner";

const columns = [
  { title: "Shop", links: ["Wall Art", "Center Tables", "Coasters", "Custom Pieces"] },
  { title: "Studio", links: ["Our Story", "The Blend Impact", "Craft Process", "Journal"] },
  { title: "Help", links: ["Shipping", "Returns", "Care Guide", "Contact"] },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1.4fr]">
          <div>
            <p className="font-display text-3xl">
              Blend<span className="text-accent">.</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/60">
              Handcrafted resin, wood and stone decor for homes that value quiet craft.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!email) return;
                toast.success("You're on the list — welcome to Blend.");
                setEmail("");
              }}
              className="mt-10 max-w-sm"
            >
              <label
                htmlFor="newsletter"
                className="text-[11px] tracking-[0.24em] text-primary-foreground/50 uppercase"
              >
                Join the studio letter
              </label>
              <div className="mt-4 flex items-center gap-3 border-b border-primary-foreground/25 pb-3 transition-colors focus-within:border-accent">
                <input
                  id="newsletter"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-transparent text-sm text-primary-foreground placeholder:text-primary-foreground/35 focus:outline-hidden"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="group shrink-0 p-1 text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <ArrowRight
                    size={18}
                    strokeWidth={1.5}
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-sans text-[11px] tracking-[0.24em] text-primary-foreground/50 uppercase">
                  {column.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#collection"
                        className="link-underline text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-primary-foreground/15 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-primary-foreground/45">
            © {new Date().getFullYear()} Blend Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[Instagram, Facebook, Youtube].map((Icon, index) => (
              <a
                key={index}
                href="#top"
                aria-label="Social link"
                className="rounded-full p-2.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Icon size={17} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
