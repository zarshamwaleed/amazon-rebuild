# Avenzo Final Polish Pass (whole site)

Final visual-polish + motion pass across the entire app, on top of ~20 prior redesign
sessions. Not a redesign — no layout, routing, backend, service, context, or hook
changes (aside from one new generic hook). Executed as: foundational motion-system
work done directly, then 6 parallel scoped passes (fork agents sharing this session's
context), each auditing its area against the brief and fixing only genuine gaps.

## Foundational additions (shared by every area)

- `src/hooks/useInView.js` — generic IntersectionObserver-once hook (threshold 0.15).
- `src/components/Reveal.jsx` — generic site-wide reveal wrapper (fade + rise 8px,
  400ms ease-out, `variant`/`delay` props for stagger). Distinct from the pre-existing
  homepage-only `src/components/home/Reveal.jsx` (700ms, different variants), which
  was deliberately left untouched to avoid disturbing 9 existing homepage call sites.
- `src/components/NumberTicker.jsx` — animates a numeric KPI from 0 to `value` over
  800ms once scrolled into view; respects `prefers-reduced-motion` (jumps straight to
  the final value).
- `src/index.css` — global `prefers-reduced-motion: reduce` kill-switch (neutralizes
  all animation/transition durations app-wide, so individual components don't each
  need their own `matchMedia` check for pure-CSS motion); shared utility classes
  `.reveal-modal` / `.reveal-dropdown` (modal/dropdown enter), `.tab-fade`
  (accordion/tab switch), `.hover-lift-card` / `.hover-lift-btn` (card/button hover),
  `.hover-zoom-img` + `.hover-zoom-img-wrap` (image hover zoom), `.table-row-hover`,
  `.link-underline-brass` (brass underline sweep for text link lists).

## What each area found and changed

**Header / nav / footer** — added hover micro-interactions (scale 1.1, 120ms) to
previously-static header icon buttons (mobile hamburger/search/close/account,
desktop wishlist heart); added brass underline hover to all footer link columns.
Everything else (nav pills, cart/account popovers, search suggestions, mobile menu
a11y) was already correct — audited, not touched.

**Homepage / product presentation** — `HomeProductCard`'s wishlist heart now bumps
on toggle (matching the shared `ProductCard`/`WishlistButton`); `RecentlyViewedStrip`
and `home/TrendingNow.jsx` gained staggered scroll-reveal (`home/Reveal.jsx`) to match
sibling sections. Everything else in this area (image zoom, card hover, empty/loading
states) was already in place from prior sessions.

**Product detail / cart / checkout** — one real gap: `AddressForm.jsx` now wires
per-field validation errors into each `Input`'s `error` prop instead of only a
generic banner (a gap flagged in project memory since Session 13). Gallery zoom,
modal entrance, review rating-bar fill animation, checkout-stepper progress fill,
and async-button loading states were all already correct.

**Auth / account / orders + a known seller-KPI cleanup** — `AuthSplitLayout` (Login/
Register) gained page-enter `Reveal` (previously zero entrance motion); `Orders.jsx`
card hover now lifts (translateY) to match the card-hover convention; `OrderDetails`'s
two modals now enter with `.reveal-modal` instead of popping in. Consolidated
`SellerPayments.jsx`'s locally-duplicated `SummaryTile` into the shared
`SellerStatCard` (added an additive `tone` prop for fee/refund color, backward
compatible) and wrapped its KPI numbers in `NumberTicker`.
`SellerGrowthOpportunity.jsx`'s `MetricTile` was deliberately **not** consolidated
(nests inside a `Card` in a tight 3-col grid — `SellerStatCard`'s own chrome would
double-box) but its numbers were still wrapped in `NumberTicker`.

**Catalog / secondary pages** — `PublicSeller.jsx` and `PublicStore.jsx` were the only
two pages in this large scope (Products/Category/SearchResults/Wishlist/Coupons/
GiftCards/Registry*/Returns/Messages/Alexa/Deals/BrowsingHistory/BuyAgain/etc.) still
showing a bare spinner while loading — replaced with shimmer-skeleton blocks shaped
like the eventual layout. Every other page already had a proper `EmptyState`,
skeleton loading, and animated progress bars.

**Prime Video + whole-app responsive/a11y spot-check** — fixed `PVSimple.jsx` (was
using the shared *light*-theme tokens instead of its own `.pv-scope` CSS vars, an
actual visual bug across 4 routes); added tab-switch fade (`.tab-fade`) to
`PVMovies`/`PVTV`/`PVMyStuff`; added hover feedback to `PVWatch`'s 5 player controls
and a smoother scrub-bar fill. Whole-app spot check turned up no new responsive/a11y
bugs (seller tables already scroll horizontally; `min-w-` usages found all sit in
wrapping flex containers; sampled `alt` text was already meaningful).

## Verification

- `npm run build` — succeeds (only a pre-existing chunk-size warning, unrelated).
- `npx eslint src` — 0 errors, 38 warnings (all pre-existing `react-hooks/exhaustive-deps`
  in seller pages, none introduced by this pass).
- Real browser verification not attempted — every session from 1 through 20 hit the
  same `claude-in-chrome` "Frame with ID 0 is showing error page" failure against this
  project's dev server; treated as a permanent environment limitation.

## Skipped (would have required a forbidden file, or judged too structural for a
"surgical" pass)

- `ProductCard` image crossfade-to-second-image on hover: the data shape passed
  through `ProductGrid` only carries a single `image_url` (no `additional_images`) —
  would require plumbing extra data through several call sites, not a small diff.
- Nothing else was blocked by scope — every fork reported it found what it needed
  inside `src/components/**` / `src/pages/**`.
