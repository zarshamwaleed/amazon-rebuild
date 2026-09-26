# Session 5 — Avenzo Homepage

**Date:** 2026-09-26
**Scope:** Redesign `src/pages/Home.jsx` into an original, premium editorial homepage using the Avenzo design system. Inspired by reference screenshots in `.design-references/` (Converse, Wink, Nestify — the user's stated `D:\Zarsham` path doesn't exist on this machine; the screenshots were actually found in the repo's own `.design-references/` folder, which is where I looked instead).

## What was built

New `src/components/home/` directory — homepage-only components, kept separate from shared primitives so this session doesn't silently restyle other pages:

- **`Reveal.jsx`** — shared scroll/entrance-reveal wrapper (IntersectionObserver-based, no animation library added). Three variants (`up`, `scale`, `fade`), used for every "in" animation on the page: hero entrance, image reveals, section headers, card grids (staggered via a `delay` prop in ms). Threshold-based, disconnects after first reveal (no re-trigger jank on scroll-back).
- **`HomeHero.jsx`** — full-bleed editorial hero (breaks out of `MainLayout`'s centered `max-w-[1500px]` container via the `left-1/2 -translate-x-1/2 w-screen` trick; safe because `index.css` already sets `overflow-x: hidden` on `html, body`). Large responsive Fraunces headline (`text-4xl` → `text-display-lg` at `lg:`), one line of supporting copy, one CTA ("Shop the Edit" → `/products`), warm gradient overlay for legibility, staggered entrance animation.
- **`FeaturedCollections.jsx`** — 3 cards built from real `categories` data (first 3 returned by `getAllCategories()`, not hardcoded to specific category names so it's robust to whatever's in the DB). Large imagery, editorial gradient overlay with name/description, "Shop now" reveals on hover. Desktop: 3-col grid. Mobile/tablet: horizontal snap-scroll carousel (deliberately not a vertical stack).
- **`EditorsPicks.jsx`** — 4 products from `getFeaturedProducts(4)` (rating-sorted = "editor's picks"). Desktop: 4-col grid, generous `gap-8`. Mobile/tablet: horizontal snap-scroll carousel.
- **`ShopByMood.jsx`** — horizontal category strip (all real categories), scroll-snap track, prev/next buttons (desktop) that scroll by `clientWidth * 0.7`, touch-swipe works natively via `overflow-x-auto`.
- **`TrendingNow.jsx`** — product grid from `getDeals(8)` (real discounted products — a different real endpoint than Editor's Picks, so the two sections don't just show the same items twice). Standard responsive grid (2/4 cols).
- **`BrandStory.jsx`** — full-bleed visual section, large Fraunces statement, one CTA to `/about`.
- **`TrustSection.jsx`** — quiet 4-up reassurance row (shipping/returns/checkout/support), icons only, no heavy visual treatment, per spec.
- **`HomeProductCard.jsx`** — a new premium product card used only by Editor's Picks and Trending Now. The existing shared `ProductCard.jsx` still has the original gray/orange Amazon styling and ~15+ other call sites across the app; restyling it was out of scope for a homepage-only session (see [[avenzo-design-system-rollout]]), so this is a parallel component rather than a shared-primitive change.

`src/pages/Home.jsx` was rewritten from scratch as a thin data-fetching orchestrator: one `Promise.all` for `getAllCategories()`, `getFeaturedProducts(4)`, `getDeals(8)`, passed down as props, with the existing `loading`/`error` pattern the rest of the app already uses (`LoadingSkeleton`, `EmptyState`).

`index.html` — the `<title>` was still the Vite default (`Vite + React`) from every prior session; changed to "Avenzo — Thoughtfully Curated Goods" since a homepage session is the right place to fix that.

**No new dependencies were added** — animations are IntersectionObserver + Tailwind transitions, matching how the existing toast/skeleton animations in this codebase are already built (`tailwind.config.js` keyframes, no framer-motion).

**Not touched:** `Slideshow.jsx`, `CategoryCardGrid.jsx`, `PromoStrip.jsx` are no longer imported by `Home.jsx` but were left in place (unused, not deleted) since deleting shared component files wasn't requested and `RecentlyViewedStrip.jsx` (also no longer on the homepage, per the spec's explicit 7-section list) is still used by `ProductDetails.jsx`. `Footer.jsx` (Session 4) was already a premium Avenzo footer — no changes needed for requirement #7.

## Real data, no fabrication

Confirmed against the actual project Supabase instance (via a direct REST probe, not just reading the code) rather than assuming the queries would work:

```
categories: 6   (Books, Electronics, Fashion, Home & Kitchen, Sports & Outdoors, Toys & Games)
featured (rating-sorted, limit 4): 4 real products returned
deals (old_price not null, limit 8): 8 real products returned
```

Every image/price/rating/category name on the homepage now comes from these three real queries — nothing is hardcoded product data. (The hero and brand-story background photos are decorative Unsplash imagery, the same pattern the pre-existing `FEATURED_CARDS` array in the old `Home.jsx` and `CategoryCard`/`ProductCard` already used — not "product data".)

## Verification performed

- `npx eslint src/pages/Home.jsx src/components/home` — 0 errors.
- `npx eslint .` (full project) — 93 pre-existing errors/warnings in unrelated files (seller pages, services), unchanged by this session; nothing in the new files.
- `npm run build` — succeeds, no new warnings beyond the pre-existing chunk-size and dynamic-import notices.
- Direct Supabase REST probe (above) — confirms the three queries the new Home.jsx relies on return real, non-empty data from the live project.
- Routes referenced by the new sections (`/products`, `/deals`, `/about`, `/category/:slug`) all checked against `App.jsx` — all exist.

**Not verified — browser automation unavailable again:** same limitation as Sessions 1–4 (see [[avenzo-design-system-rollout]]) — `mcp__claude-in-chrome__tabs_context_mcp` timed out twice ("Chrome extension is connected but the page may be loading, unresponsive..."), so I could not screenshot, click through breakpoints, or read live console errors. I did not retry beyond that, per the existing guidance. The dev server was started and left running for the user to check directly:

```
npm run dev   →  http://localhost:5174/   (5173 already had a server running from an earlier/other session)
```

**The user should do a real browser pass** — desktop/tablet/mobile widths, hover states, the scroll-reveal timing, and a console-error check — before considering this visually verified. Everything above the browser layer (data, routing, build, lint) is verified.
