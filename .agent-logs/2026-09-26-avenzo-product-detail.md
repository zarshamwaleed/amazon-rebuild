# Session 7 — Avenzo Product Detail Experience

Redesigned the product detail page (`src/pages/ProductDetails.jsx`) onto the Avenzo design system (warm bone/stone/charcoal/brass palette, Fraunces + Inter, named shadow/motion tokens — see `tailwind.config.js` and `src/index.css`), following the same rollout as prior sessions. See [[avenzo-design-system-rollout]] / `.agent-logs/2026-09-26-avenzo-design-system.md` for token reference.

## Components touched

- `src/pages/ProductDetails.jsx` — full layout rewrite
- `src/components/ProductGallery.jsx` — full rewrite
- `src/components/QuantitySelector.jsx` — restyle + micro-animation
- `src/components/WishlistButton.jsx` — restyle + bump feedback
- `src/components/ReviewsList.jsx` — restyle to editorial cards
- `src/components/AddToRegistryModal.jsx` — restyle (triggered directly from the redesigned purchase panel, so it needed to match)

## Real data surfaced that wasn't rendered before

While reading `SellerProductEditor.jsx`/`sellerService.js` to understand the product schema, found the `products` table already has `additional_images`, `variations` (`[{name, options}]`, e.g. `{name:'Color', options:'Black, White, Blue'}`), `bullet_points`, `manufacturer`, `product_type`, `sku`, and `msrp` columns — all written by the seller product editor but **never read** by the old `ProductDetails.jsx`, which only used `image_url`, `description`, `brand`. Confirmed via a live Supabase REST query: a real product ("laptop") has 1 extra `additional_images` entry and 5 `bullet_points`. No product in the current DB has `variations` populated yet, so that path is implemented and defensively guarded (`filter(v => v.name && v.options)`) but unverified visually — it will render as soon as a seller adds one.

This is not mock data — it's existing schema fields now actually displayed:
- Gallery now shows `image_url` + `additional_images` as a real multi-image set.
- New "Highlights" list in the info column and "Description" tab use `bullet_points`.
- New "Specifications" tab shows `brand` / `manufacturer` / `product_type` / `sku` / `msrp` (only the fields that exist on a given product) plus a `fulfillment_method`-derived "Fulfilled by Amazon Rebuild" / "Fulfilled by seller" line.
- New variant selector (pill groups per `variations` entry) — presentational only (local selection state), since the schema has no per-variant price/stock/SKU to actually gate `addItem`/cart with. Doesn't change what gets added to cart, consistent with "preserve cart behavior."

## ProductGallery

Rewritten around an `images` array prop (was a single `image` string) — the only call site (`ProductDetails`) now passes `[image_url, ...additional_images]`, deduped. Single-image products (the common case today) render identically minus the now-hidden thumbnail rail/arrows.

- Hero image with cursor-follow zoom (mouse position → `transform-origin` + `scale(1.8)` on hover) and a "Zoom" hint pill.
- Click the hero to open a fullscreen lightbox (prev/next, Esc via backdrop click, close button) — reuses the existing `animate-fade-in` / `animate-scale-in` keyframes already in `tailwind.config.js`.
- Thumbnail strip: vertical column left of the hero on `md:`+, horizontal scroll strip below the hero on mobile.
- Prev/next arrow buttons on the hero itself, visible on hover (desktop) — always reachable via thumbnails on touch.
- Crossfade between images via stacked absolutely-positioned `<img>`s with opacity transition (`duration-slow`), not a hard cut.

## ProductDetails page

- 12-col desktop grid: gallery (6) / info column (3) / sticky purchase panel (3, `lg:sticky lg:top-8` — the header isn't itself `position: sticky`, so a modest offset was enough).
- Title is now `font-display` (Fraunces) at `heading-page`→`display-sm`, replacing the old plain `text-2xl font-medium` — the "editorial serif" hierarchy the brief asked for.
- Price: `font-display text-display-sm` in the info column, repeated (Amazon-convention) in the sticky buy box; discount badge switched from the old hardcoded `#cc0c39` red rectangle to the Avenzo `error-50/700` pill.
- Rating + review count is now a button that sets the new tabs state to "Reviews" and scrolls the tabs section into view (`tabsRef.current.scrollIntoView`), rather than being inert text.
- Coupon "clip" card restyled onto `brass-50/200` tokens; clip/unclip logic (`useCoupons()`) untouched.
- New `VariantGroup` inline component renders each `variations` entry as an uppercase label + pill button row with local `useState` selection (see "Real data surfaced" above for why it's presentation-only).
- **Description / Specifications / Reviews / Delivery & Returns** are now one tab strip (brass underline indicator, `animate-fade-in-up` content swap keyed by tab) rather than three separate stacked sections. Reviews moved from an always-visible section into the "Reviews" tab, reachable directly from the rating link.
- Delivery tab adds a real, in-app-consistent "Easy returns" line linking to `/returns` (the existing `MyReturns` page/route) — not fabricated copy, the feature already exists in the app.
- Add to Cart button shows a brief inline checkmark ("Added") for 1.6s after a successful `addItem` (mirrors `ProductCard`'s quick-add pattern) — this is in addition to, not a replacement for, the existing toast (`CartContext.addItem` already calls `pushToast('Added to cart', ...)`, untouched).
- Loading skeleton replaced the hand-rolled `bg-gray-100 animate-pulse` blocks with `skeleton-shimmer` (Avenzo shimmer, same treatment as `LoadingSkeleton.jsx`).
- "Related products" / "You may also like" / "Other products from this seller" headers switched from plain `<h2>` to the shared `SectionHeader` component (already Avenzo-styled, previously unused anywhere in the app per Session 6's notes — now has its first real call sites).
- All data-fetching `useEffect`s, Supabase queries, `getRecommendations`, `getCouponsForProduct`, `useRecentlyViewed`, and the seller/related/recommendations state are byte-for-byte the same logic as before — only JSX/styling changed.

## QuantitySelector / WishlistButton

- `QuantitySelector`: restyled onto Avenzo tokens; the number now re-mounts (`key={value}`) into the existing `animate-scale-in` keyframe on every change, a subtle "transition" without a new animation being invented.
- `WishlistButton`: restyled (brass instead of red for the active state, to fit the palette); added a `bump` animation (same `animate-bump` keyframe `CartButton.jsx` already uses for its count badge) that fires once when a product transitions into the wishlisted state. `useWishlist()` hook usage/behavior unchanged.

## ReviewsList

Same props (`productId`, `rating`, `reviewCount`) and same two service calls (`getProductReviews`, `getProductRatingSummary`) — visual-only rewrite:
- Left summary: large `font-display` average score, `Rating` (now `size="lg"`), rating-breakdown bars restyled onto `brass-500` fill / `stone-200` track with rounded ends.
- Right: each review is now an editorial card (bone surface, rounded-xl, subtle border/shadow) with an initial-letter avatar circle, `Reveal`-staggered scroll-in (reusing the homepage's `Reveal` component, same pattern `ProductGrid` already uses for cards).

## AddToRegistryModal

Restyled only (rounded-2xl, Avenzo surfaces, shared `Button` component for its Cancel/Add actions) — every prop, handler, and service call (`getMyRegistries`, `addRegistryItem`) is unchanged.

## Verification

- `npm run build` — succeeds (pre-existing chunk-size warning only).
- `npx eslint` on all six touched files — 0 errors, 1 pre-existing warning (`react-hooks/exhaustive-deps` on the coupon-fetch effect in `ProductDetails.jsx`, unchanged from the original file — same accepted pattern noted in Session 6 for `ProductCard`).
- Live Supabase REST query confirmed real `additional_images`/`bullet_points` data exists and is now rendered; confirmed no product currently has `variations` populated (that path is implemented but visually unverified).
- **Browser screenshot verification was not possible**, same recurring issue as every prior Avenzo session: `mcp__claude-in-chrome__navigate` succeeds (tab title/URL update correctly, `curl` gets `200`), but `computer screenshot` immediately fails with "Frame with ID 0 is showing error page." Confirmed again this session against `localhost:5176`. A real `npm run dev` check by the user is still outstanding — the dev server was left running at `http://localhost:5176/products/5b079b7b-850e-41d2-919c-ee370971c40e` (the "laptop" product, which has 2 gallery images and 5 highlight bullets) for a quick manual look.

## Not touched (deliberately out of scope)

- Cart/wishlist/coupon/registry/review/recommendation service logic and API calls — all preserved exactly.
- `ProductCard`, `ProductGrid`, `SectionHeader`, `Rating` — already Avenzo-styled from Session 6, reused as-is.
- Product data model / Supabase schema — nothing added or migrated; only existing columns are now read.
