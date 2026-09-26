# Session — Avenzo Homepage Redesign (from scratch)

**Date:** 2026-09-26
**Scope:** Full from-scratch redesign of `src/pages/Home.jsx` and `src/components/home/*`, per explicit user instruction to discard the existing (Session 5/6/13) homepage composition and rebuild with a new concept — not a re-skin.

## Why a full rewrite, not an incremental pass

The prompt for this session was a near-verbatim replay of the original Session 5 brief (down to referencing `Hero.jsx`/`Slideshow.jsx`/`CategoryCard.jsx`/`CategoryCardGrid.jsx`, all four already deleted as confirmed-dead code in Session 13). The homepage it asked for — editorial hero, featured collections, curated picks, discovery section, brand story, trust section, pre-footer, footer, all on real data with scroll motion — already existed almost exactly as specified. I flagged this to the user before doing anything (`AskUserQuestion`) rather than assume; they explicitly chose "Full from-scratch redesign anyway." So this session intentionally discards the prior `home/*` composition (rather than iterating on it) and ships a distinct concept, to avoid just producing a re-skin under a "from scratch" instruction.

## What changed conceptually vs. the previous homepage

The prior homepage's pattern (full-bleed photo-hero → 3-col collection grid → 4-col product grid → horizontal category scroller → 4-col product grid → full-bleed photo+quote → icon row) is replaced with a tighter, less repetitive structure — fewer sections, each doing one clearly different job, so nothing reads as "another product grid" or "another category strip":

1. **`HomeHero.jsx`** — rebuilt as an asymmetric split (text column + image collage), not text-over-photo. The collage is two images (a tall primary + an overlapping detail square, hidden below `sm` to avoid mobile cramping) with independent scroll-linked parallax (`useParallax` hook — `requestAnimationFrame` + `getBoundingClientRect`, no-ops under `prefers-reduced-motion`). A floating stat chip shows the real category count (passed down once `getAllCategories()` resolves) and tilts slightly on hover via a `group-hover` CSS transform — no cursor-tracking JS.
2. **`Marquee.jsx`** (new) — a thin continuous brand-values band directly under the hero. Pure CSS keyframe loop (`animate-marquee`, added to `tailwind.config.js`), pauses on hover via `hover:[animation-play-state:paused]`, disabled under `motion-reduce`. This is signature motion moment #1.
3. **`FeaturedCollections.jsx`** — rewritten from an equal 3-up grid into an asymmetric bento (one large 2×2 tile + two stacked 2×1 tiles, tiling a 4-col/2-row grid exactly for 3 categories). Stacks to a plain single column below `sm`.
4. **`EditorsPicks.jsx`** — rewritten from a uniform 4-up grid into a spotlight-plus-shelf: the first `getFeaturedProducts()` result renders large (image, brand, title, live description, price/rating, CTA), the rest render as a smaller horizontal shelf using the existing `HomeProductCard`. Bumped the fetch limit from 4 → 6 in `Home.jsx` so the shelf has 5 items.
5. **`TrendingNow.jsx`** — rewritten from a 4-col product grid into a ranked two-column list (numbered rows, thumbnail, title, rating, price/discount, hover arrow) built from `getDeals(8)`. Deliberately a different visual language from Editor's Picks so the two curated/trending sections don't read as duplicates — this is the "discovery section" requirement.
6. **`ShopByMood.jsx` — deleted.** It was a second category-browsing strip sitting right below the new bento `FeaturedCollections`; keeping both made the page feel crowded and repetitive rather than composed. Confirmed zero remaining references before deleting (`grep`), consistent with the Session 13 dead-code-removal convention.
7. **`BrandStory.jsx`** — kept as the one full-bleed photo+text moment (now the only place that treatment appears, since the hero no longer uses it), rewritten as a large italic Fraunces pull-quote with attribution rather than a paragraph.
8. **`TrustSection.jsx`** — rewritten from an icon+text row into a numbered editorial band (`01–04`, thin dividers at `lg:`+ only — same four real policies: free shipping over $50, 30-day returns, secure checkout, support).
9. **`RecentlyViewedStrip.jsx` — newly wired into the homepage** (it previously wasn't rendered there at all, only on `ProductDetails.jsx`). Left the component itself untouched since it's shared with `ProductDetails.jsx` (out of scope to change); instead `Home.jsx` reads `getRecentlyViewedIds()` once on mount and only renders the section's padding/border wrapper when there's actually something to show, avoiding an empty gap.
10. **`BrandPromise.jsx`** (new) — the pre-footer moment. Deliberately a brand-statement band with two real CTAs (`/products`, `/deals`), not an email-capture form — there's no newsletter/subscription service anywhere in this codebase, and a form that visually "submits" without a backend would be dishonest UI.

`Home.jsx` is now a thin orchestrator: one `Promise.all` for `getAllCategories()` / `getFeaturedProducts(6)` / `getDeals(8)`, same `loading`/`error` pattern as before, passed down as props.

**Not touched:** `ProductGrid.jsx`, `ProductCard.jsx`, `PromoStrip.jsx` (none are used on the homepage — `HomeProductCard.jsx` remains the deliberate homepage-only tile, per the established pattern from Session 6) and `CategoryCard.jsx`/`CategoryCardGrid.jsx` (confirmed dead in Session 13, not recreated). `Footer.jsx` unchanged (already Avenzo-styled since Session 4).

## Real data, no fabrication

Verified against the live Supabase project via direct REST probe (not just reading the code):

```
categories: 6 real rows (Electronics, Books, Home & Kitchen, Fashion, Sports & Outdoors, Toys & Games)
featured (rating desc, limit 6): 6 real products, ratings 4.6–4.8
deals (old_price not null, limit 8): 7+ real discounted products
```

Every price/rating/category/product image on the page comes from these queries. Hero and brand-story photography are decorative stock imagery (same convention as every prior session).

## Verification performed

- `npx eslint src/pages/Home.jsx src/components/home src/components/RecentlyViewedStrip.jsx` — 0 errors.
- `npm run build` — succeeds; only the pre-existing chunk-size/dynamic-import notices (unrelated, present before this session).
- Routes referenced (`/products`, `/deals`, `/about`, `/category/:slug`) checked against `App.jsx` — all exist.
- Direct Supabase REST probe (above) — confirms real, non-empty data for all three queries the page depends on.
- Manual responsive review of every new component's Tailwind breakpoints for 375 / 768 / 1440px (no browser available — see below): mobile stacks are single-column with no fixed widths wider than the viewport; the hero's second collage image is hidden below `sm` specifically to avoid cramping; the bento collections grid and the trending two-column list both gain real tablet-width adaptations at `sm`/`md` rather than just shrinking; desktop (1440, inside the `max-w-[1500px]` shell) has room to spare in every section.

**Browser verification: attempted, same result as every prior session (14 in a row) for this project.** Started the dev server (`npm run dev`, resolved to port 5182 — ports 5173–5181 were already occupied by leftover servers from earlier sessions), confirmed `curl` gets a real `200` from it, then tried the Chrome extension: `navigate` succeeded, but `computer` (screenshot) and `get_page_text` both failed with `Frame with ID 0 is showing error page`, and `read_console_messages` returned nothing (screenshot failure meant no reliable console-load capture either). This is the identical failure signature documented in every session since Session 1 — treated as a permanent environment limitation for this project, not retried further. Dev server process was stopped after the attempt.

**The user should do a real browser pass** — desktop/tablet/mobile widths, the hero parallax, marquee pause-on-hover, spotlight/shelf and trending-list hover states, and a console-error check — before considering this visually verified. Everything above the browser layer (data, routing, build, lint, real-data wiring) is verified.
