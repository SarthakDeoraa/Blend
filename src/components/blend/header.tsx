import { useEffect, useState } from "react";
import { Search, User, Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

const announcements = [
  "Free Nationwide Shipping",
  "Sustainable & Handcrafted",
  "10% Off Your First Order",
];

const navLinks = [
  { label: "Collections", to: "/collections" },
  { label: "Clocks", to: "/collections/clocks" },
  { label: "Center Tables", to: "/collections/center-tables" },
  { label: "Wall Art", to: "/collections/wall-art" },
];

function TopBar() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % announcements.length);
        setFading(false);
      }, 600);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-primary text-primary-foreground/85">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center px-4">
        <p
          className="text-[11px] tracking-[0.28em] uppercase transition-opacity duration-600"
          style={{ opacity: fading ? 0 : 1 }}
        >
          {announcements[index]}
        </p>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <TopBar />
      <div className="border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 md:grid-cols-3 md:px-8">
          <Link to="/" className="font-display text-2xl tracking-tight">
            Blend<span className="text-accent">.</span>
          </Link>

          <nav className="hidden items-center justify-center gap-9 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                activeProps={{ className: "text-foreground" }}
                className="link-underline text-[13px] tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1">
            <button
              aria-label="Search"
              className="rounded-full p-2.5 transition-colors hover:bg-secondary"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Account"
              className="hidden rounded-full p-2.5 transition-colors hover:bg-secondary sm:block"
            >
              <User size={18} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="rounded-full p-2.5 transition-colors hover:bg-secondary md:hidden"
            >
              {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-border/60 px-5 py-4 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-3 text-sm tracking-wide transition-colors hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}