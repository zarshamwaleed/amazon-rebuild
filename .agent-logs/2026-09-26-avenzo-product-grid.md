# Session 6 — Avenzo Product Experience

Redesigned the reusable product-presentation components used across the app onto the Avenzo design system (warm bone/stone/charcoal/brass palette, Fraunces + Inter, named shadow/motion tokens — see `tailwind.config.js` and `src/index.css`).

## Components touched

- `src/components/ProductCard.jsx`
- `src/components/ProductGrid.jsx`
- `src/components/CategoryCard.jsx`
- `src/components/CategoryCardGrid.jsx`
- `src/components/Rating.jsx`
- `src/components/SectionHeader.jsx`
- `src/components/PromoStrip.jsx`
- `src/components/RecentlyViewedStrip.jsx`

## ProductCard

The shared product tile (rendered by `ProductGrid`, used by ~10 pages: Products, Category, SearchResults, Deals, Wishlist, BuyAgain, BrowsingHistory, PublicStore, PublicSeller, ProductDetails' related/recommendations/recently-viewed rails).

- Image: square, `object-cover`, `scale-[1.07]` on hover over a `duration-slower` transition — a zoom, not a jump.
- Wishlist heart and quick-add (+) are always-visible circular buttons over the image (not hover-reveal), so the feature is reachable on touch devices, not just desktop hover. Quick-add shows a brief checkmark + success color on success, disables when out of stock.
- Wishlist now goes through `useWishlist()` directly (like `HomeProductCard`) instead of the generic `WishlistButton` component, for a tighter, restyled heart button consistent with the new card. `WishlistButton.jsx` itself is untouched — it's still used as-is by `ProductDetails`' full-width variant.
- Quick-add calls `useCart().addItem(product, 1)` — real cart integration, no stub.
- Price hierarchy: `text-price` (semibold, larger) for the current price, `text-caption line-through` for the old price, a dark pill "-N%" badge over the image for the discount itself (kept separate from the price line so the price line stays clean).
- Coupon badge (existing `getCouponsForProduct` fetch, unchanged) now renders as a brass pill next to the discount badge instead of a dark rectangle.
- Rating, brand, "Sold by Seller", and out-of-stock indicator are all preserved from the original — no functionality dropped, just restyled.
- Card lift (`hover:-translate-y-0.5`) + `shadow-card` (restrained, from the existing Avenzo shadow scale) instead of `shadow-lg`. Radius is `rounded-xl`, not `rounded-2xl` — deliberately smaller than the homepage's `HomeProductCard` since this card appears in dense grids, not editorial spotlights.
- Removed a dead import (`useCoupons` from `CouponsContext`) that was never called in the original file.

## ProductGrid

- Same `products` + `cols` (3/4/5, plus a new optional `2`) contract — no call site changes needed.
- New optional `loading` prop: renders the existing `LoadingSkeleton` at the same `cols`. Purely additive — every current call site manages its own loading state externally (e.g. `Products.jsx`) and doesn't pass this prop, so behavior there is unchanged.
- Each card now enters via the homepage's `Reveal` component (`src/components/home/Reveal.jsx`, reused rather than duplicated) — a restrained fade/rise on scroll-into-view, staggered up to 7×40ms so large grids don't all animate at once.
- Gap tightened responsively (`gap-3.5` → `gap-5` at `sm:`) for a cleaner mobile grid.

## Rating

- Rewrote the fill logic to support true partial stars (not just half): a full row of dim stars with a brass-colored copy clipped to `value/5 * 100%` width, so e.g. 3.7 renders as 3 lit + a 70%-lit 4th + a dim 5th.
- Added `role="img"` + `aria-label` ("Rated 3.7 out of 5 stars") for accessibility — previously had none.
- Sizes: `sm | md | lg` (was `sm | lg` with `sm` as the undeclared default; default is now the more legible `md`, verified against every call site — none relied on the old implicit default look).
- `count` behavior unchanged (shown only when passed; every current call site either passes it deliberately or omits it, confirmed via grep).

## CategoryCard / CategoryCardGrid

Neither had any active call sites in the app (grep confirmed — not imported by any page), so this was a from-scratch application of the Avenzo look with the existing prop contracts preserved exactly (`category.{slug,name,description,image_url}` for `CategoryCard`; `cards[].{id,title,primary,tiles,link}` for `CategoryCardGrid`) so they're ready to use as soon as a page wants them.

- `CategoryCard`: full-bleed `aspect-[4/5]` image, single bottom gradient overlay for legibility (the one deliberate gradient in this session — needed, not decorative), Fraunces title, "Shop now →" that slides in on hover.
- `CategoryCardGrid`: kept its three-tier layout (title, optional primary image, optional 2-col tile grid, optional link) but restyled onto Avenzo surfaces/typography; image tiles get a modest `scale-105` on hover via named Tailwind groups (`group/tile`, `group/primary`) since each card holds multiple independently-hoverable images.

## SectionHeader

- Kept `title` + `seeMoreTo` exactly as before (only real usage found was a local, unrelated shadow component of the same name in `SellerSettings.jsx` — not the shared one; the shared component had no live call sites either).
- Added, additively: `subtitle`, `ctaLabel` (defaults to `"See more"`, previously hardcoded), `align` (`left | center`).

## PromoStrip

- Same `title` / `subtitle` / `cta` / `to` contract.
- Restyled from the old navy/orange Amazon banner to a single `charcoal-900` surface with one `brass-500` pill CTA — no gradients, one accent color, matches the "restrained, premium" brief.

## RecentlyViewedStrip

- Data-fetching logic (localStorage IDs → Supabase `in()` query → order-preserving map) is untouched.
- Changed presentation from a `ProductGrid` (wrapping grid) to an actual horizontal scroll strip: `overflow-x-auto` + `snap-x snap-mandatory`, fixed-width (`w-44 sm:w-56`) `ProductCard` tiles, reusing the new `SectionHeader` for the "Recently viewed" title instead of a plain `<h2>`.

## Verification

- `npm run build` — succeeds (pre-existing chunk-size warning only, unrelated to this session).
- `npx eslint` on all eight touched files — 0 errors, 1 pre-existing-pattern warning (`react-hooks/exhaustive-deps` on the coupon-fetch effect in `ProductCard`, matching how similar effects are written elsewhere in this codebase).
- **Browser verification was not possible.** As in every prior Avenzo session, `mcp__claude-in-chrome__*` connects but any screenshot/read against the local Vite dev server returns "Frame with ID 0 is showing error page," even though `curl` from the agent's own shell gets a `200` from the same URL — the extension's browser context can't reach this sandbox's dev server. Confirmed again this session with fresh attempts against both `localhost:5175` and `127.0.0.1:5175`. A real `npm run dev` visual check by the user is still outstanding.

## Not touched (deliberately out of scope)

- `WishlistButton.jsx` — still the original styling; only its `useWishlist` hook pattern was reused inline in `ProductCard`.
- `LoadingSkeleton.jsx` — already Avenzo-styled from Session 2; `ProductGrid`'s new `loading` prop just calls into it unchanged.
- Pages themselves (`Products.jsx`, `Category.jsx`, `Deals.jsx`, etc.) — still on the original gray/yellow styling outside of the components they render; per the ongoing rollout, page-level migration is a separate, later session.
