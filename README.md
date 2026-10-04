# Blend Boutique Launch

Act as an elite UI/UX Designer and Senior Frontend Engineer. Build a premium, highly aesthetic, and modern e-commerce landing page for a handcrafted home decor and resin art brand named "Blend". Do not use generic templates. The site must feel expensive, bespoke, fully responsive (mobile-first), and feature buttery-smooth, scroll-triggered animations and micro-interactions.

Global Design System & Vibe:

Brand Identity: "Blend" focuses on the seamless fusion of natural elements (wood, stone, resin) into modern art and functional decor.

Color Palette: Earthy, warm, and sophisticated. Use a soft Warm Sand/Oatmeal for the background, deep Charcoal/Onyx for primary text, and a muted Terracotta or Olive Green for accents, tags, and secondary buttons.

Typography: Pair a luxurious, high-contrast serif for headings (like Playfair Display, Ogg, or Lora) with a highly legible, geometric sans-serif for body text and UI elements (like Manrope, Inter, or Plus Jakarta Sans).

UI Characteristics: Soft diffused drop-shadows on hover, large smooth border-radiuses (e.g., rounded-2xl or rounded-3xl in Tailwind), glassmorphism for sticky elements, and extensive use of negative/white space to let the products breathe.

Animations: Use subtle Framer Motion-style entrance animations (fade up and gently scale in on scroll). Hover states should feel tactile (e.g., buttons sweeping with color, images slowly scaling to 105%).

Page Structure & Components:

1. Minimalist Top Bar & Header:

Top Bar: A slim, deep charcoal bar with a subtle, slow-fading text rotation (e.g., "Free Nationwide Shipping" -> "Sustainable & Handcrafted" -> "10% Off First Order").

Sticky Navbar: A frosted glass (backdrop-blur-md) header. Left-aligned minimalist logo "Blend.", center-aligned clean navigation links with a sliding underline hover effect, and right-aligned minimalist Lucide icons (Search, Account, Cart).

2. Immersive Hero Section:

Layout: A massive, full-width section with a beautifully styled, high-end interior decor background image or looping abstract texture.

Content: Large, elegant serif typography that reads: "Where Nature Meets Modern Living." Below it, a short sans-serif subtitle.

CTA: A pill-shaped, solid charcoal button saying "Explore the Collection". When hovered, it should slightly elevate and add a glowing shadow.

3. "Shop by Form" (Curated Navigation):

Inspiration twist: Instead of standard circles, use tall, soft-cornered vertical pill shapes (rounded-full on the y-axis) for categories (e.g., Wall Art, Center Tables, Coasters, Custom Pieces).

Interaction: Placed in a horizontal scrollable row hiding the scrollbar. Hovering darkens the image slightly and slides up the category title in elegant white text.

4. The "Signature Blend" (Featured Products):

Header: Center-aligned heading with a very subtle, modern divider.

Product Grid (Bento/Staggered): Create a 3-column or 4-column grid.

Cards: Clean, borderless cards with a subtle gray background.

Image: High-res image with a smooth 105% zoom on hover.

Badges: Small, chic floating tags (e.g., "Bestseller" or "Save 15%") in the Terracotta/Olive accent color.

Details: Left-aligned product name, star rating (using minimalist stars), and price.

Action: A sleek "Quick Add" button that is hidden by default and smoothly slides up from the bottom of the image container when the user hovers over the card.

5. Community Proof (Reels/Testimonials):

Heading: "Loved by homes across the country."

Layout: A sleek, drag-to-scroll carousel of vertical video/image cards mimicking Instagram Reels or TikToks, but encased in premium UI styling (no harsh borders, soft shadows). Include a custom "Drag" cursor hint on hover.

6. "The Blend Impact" (Purpose Section):

Inspiration twist: A beautiful split-screen or asymmetrical layout.

Visuals: One side features a high-quality, heartfelt image (e.g., community work, animal rescue, or sustainable crafting) inside a frame with unique, soft-rounded corners.

Text: The other side features bold typography: "Crafting a Better World." Explain the give-back initiative (e.g., "For every piece of art you bring home, we provide a meal to an animal in need."). Include a subtle "Learn More" text link with a right arrow that translates slightly on hover.

7. Trust Signals & FAQ:

Trust Icons: A minimalist horizontal row of 4 Lucide line-art icons (Secure Checkout, Artisan Crafted, Carbon Neutral, 24/7 Support) with short text. They should gently pop into view on scroll.

FAQ: A hyper-clean accordion section. No boxes around the questions, just sleek horizontal dividing lines. The "+" icon smoothly rotates 45 degrees to an "x" when opened, revealing the answer with a soft slide-down animation.

8. Footer:

A spacious, deep Charcoal footer with off-white text.

Include a sleek newsletter signup input field (just an email line and a submit arrow), links grid, and minimal social icons.

Floating Element: A modern, subtle floating chat/support bubble pinned to the bottom right.

Technical Requirements for Generation:

Use Tailwind CSS for all styling.

Ensure the layout is flawless on mobile (stack grids, use horizontal overflow scrolling for categories and videos).

Implement Lucide React for all iconography.

Focus heavily on the typography hierarchy and padding/margins to achieve a "luxury" aesthetic.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://blend-art-luxe.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0ef0b526-ee37-4717-8cb3-58f768754a90).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
