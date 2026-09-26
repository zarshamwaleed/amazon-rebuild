# Avenzo — Gift Cards, Product Cards, Category Hero

Session: redesign three visually-dated surfaces to match the Avenzo identity — the Gift Cards landing page, the shared `ProductCard`, and the Category/Search/Products page headers. Presentation-only; no backend/database/services/context/hooks/api/routing changes (the gift card design *data source* was switched from an in-file mock catalog to the existing `gift_card_designs` table, which is a data-wiring fix inside the in-scope page file, not a service/schema change — see below).

## Fix 1 — Gift Cards page (`src/pages/GiftCards.jsx`)

**Key finding before writing any code:** the file already had `getGiftCardDesigns()` available from `src/services/giftCardService.js`, but the page never called it — it rendered four local mock arrays (`POPULAR`, `AMAZON_CARDS`, `DIGITAL_CARDS`, `PHYSICAL_CARDS`, `RECOMMENDED`) with fabricated ids, fake ratings/review counts, and fixed per-design prices. The brief explicitly said gift card data "comes from the existing `gift_card_designs` table" and "do not introduce mock data" — so this session replaced the mock arrays with a real fetch.

Probed the live table via a read-only REST call (anon key, `select=*`) since no schema doc exists for it locally. Real shape: `id, name, tagline, category, delivery_type, gradient, image_url, featured, created_at` — 23 rows across `category` (amazon/any/baby/birthday/congratulations/holiday/thank-you/travel/wedding/wellness) and `delivery_type` (email/physical/print). **No `price` column** — a design is a template; the dollar amount is chosen by the buyer in `AddGiftCardModal` (`AMOUNTS = [25,50,100,150,200]`, custom $5–$500). This is actually a more correct model than the mock data's baked-in fixed prices, and fixes a latent bug: the mock `card.id` values didn't reliably match real `gift_card_designs.id` rows, so gift cards added from this page could have flowed a bogus `design_id` into `issueGiftCardsForOrder` at checkout.

Rewrote `GiftCards.jsx` to fetch once via `getGiftCardDesigns()` and partition the real rows into sections (no filtering/pagination needed at 23 rows):
- **Popular** — `featured === true`
- **Avenzo Gift Cards** (was "Amazon Rebuild Gift Cards") — `category === 'amazon'`
- **Gift Cards for Every Occasion** (was "Digital Gift Cards") — `category !== 'amazon' && delivery_type === 'email'`
- **Ship or Print** (was "Physical Gift Cards") — `delivery_type !== 'email'`
- Dropped the standalone mock "Recommended for You" row (its 6 items were 1:1 fabricated duplicates of real occasion designs already surfaced above — no distinct data left to back a separate section once mock data was removed).

**"Amazon" branding:** the DB rows themselves still have literal names like "Amazon Rebuild Gift Card" / "Amazon Rebuild Gold" (pre-existing seed data — did not touch the table). Added a presentation-only `displayName()` that regex-replaces `Amazon Rebuild` → `Avenzo` for render, leaving the stored rows untouched. Also fixed one hardcoded `Amazon Rebuild` string literal inside `AddGiftCardModal.jsx`'s card-preview header (that modal renders as part of this same /gift-cards flow, so it was in scope for the "no Amazon text anywhere" verify item even though it wasn't one of the three named files).

**New card visual** (`GiftCardTile`, replaces the old flat-color `GiftCardTile`/`DigitalCard`/`PhysicalCard`/`RecommendedCard` variants): renders the design's own `gradient`/`image_url` fields, with a charcoal duotone wash + a fine diagonal line pattern + a large low-opacity Fraunces-italic "A" monogram + a small Fraunces-italic "Avenzo" wordmark + a brass star seal on featured cards, all layered on top via CSS — nothing added to the table. Denomination is shown as the real `$25–$500` range (matches `AddGiftCardModal`'s actual bounds) in Fraunces display type rather than a fabricated fixed price. A `compact` size variant serves the denser 6-column "Avenzo Gift Cards" row.

**Tailwind gotcha hit and fixed:** `gradient` values are fetched from Supabase at runtime (e.g. `from-[#232f3e] to-[#131921]`, `from-amber-500 to-yellow-500`, `from-emerald-600 to-green-700`, 17 distinct pairs across the 23 rows) — Tailwind's JIT scanner only sees literal text in source files, so these never get compiled and would silently render with no gradient. Added a `safelist` array to `tailwind.config.js` (31 explicit class names, commented with provenance and instructions to extend it if a new design is added with a new color combo) rather than a broad regex, to keep the CSS bundle precise. Verified post-build by grepping the compiled CSS for `.from-emerald-500`, `.to-fuchsia-500`, and the raw `232f3e`/`131921` hex fragments — all present. This also fixes `CartItem.jsx`'s existing (unmodified) gift-card mini-preview, which reads the same `gradient` string once a real design flows through the cart.

Redeem form and balance widget were restyled only (background/border/typography polish, "Amazon Rebuild" → "Avenzo" in copy) — left the simulated `setTimeout` redeem handler and static `$0.00` balance exactly as they were; wiring them to the real `redeemGiftCardCode`/`getUserGiftCardBalance` RPCs (which already exist and are used by the separate `GiftCardRedeem.jsx`/`GiftCardBalance.jsx` pages) is business-logic wiring, out of scope for a visual-redesign session per the brief's own rules.

## Fix 2 — Product cards (`src/components/ProductCard.jsx`)

Single shared component — used by `ProductGrid`, which is the only thing `Products.jsx`, `Category.jsx`, and `SearchResults.jsx` render products through, so this one file's redesign covers all three routes automatically. Changes:
- Image inset via a `p-2.5` wrapper around its own `rounded-xl` box (was edge-to-edge inside the card).
- Title bumped to `text-[15px]`/`text-charcoal-900` (was `text-av-body-sm`/`text-charcoal-800`).
- Price switched to `font-display` (Fraunces) at `text-xl`, replacing the shared `.text-price` utility class *for this component only* — left `.text-price` itself untouched since it's used across ~15+ other call sites and changing it globally wasn't asked for.
- Discount badge recolored from a dark `bg-charcoal-900/90` chip to `bg-brass-500` (brass accent, not a red/dark box).
- Wishlist heart: added a nested (unnamed) `group`/`group-hover` on the button itself so the icon turns brass on hover without touching the outer card's own `group` (Tailwind resolves `group-hover:` to the nearest ancestor `.group`, so nesting is safe with no naming collision).
- Replaced the floating circular "+" quick-add button with a full-width ink (`bg-charcoal-900`) bar pinned to the bottom of the image via `translate-y-full` → `group-hover:translate-y-0`.
- Hover lift changed from `-translate-y-0.5`/`scale-[1.07]` to the brief's specified `-translate-y-1` (4px) / `scale-[1.04]`.

## Fix 3 — Category/Search/Products headers

`Category.jsx` and `Products.jsx` needed **no changes** — both already pass the right props (`eyebrow`, `title`, `count`, `description`, `image`, `breadcrumb`) into the shared `CategoryHeader.jsx`, so the whole fix lives in that one component. Rewrote it from a full-bleed image + `from-charcoal-900/75` dark gradient overlay into a two-column layout: left column (breadcrumb → brass eyebrow → `font-display text-[2.25rem] md:text-[3.5rem]` title → description → result count) on a `bg-bone-100` canvas block, right column a single `aspect-[4/3] rounded-2xl` inset image (hidden below `md` to keep mobile clean) with a Fraunces-italic brass monogram fallback (category's first letter) when `image` is falsy — no dark overlay over any photo anymore.

`SearchResults.jsx` has its own hand-rolled header (never used `CategoryHeader` — there's no per-search image to show), so it doesn't share the two-column pattern. Restyled just its typography/canvas treatment to match (same `bg-bone-100` rounded block, same `text-[2.25rem] md:text-[3.5rem]` Fraunces sizing, brass eyebrow with the search icon) without inventing a fake image column.

## Verification

- `npm run build` — succeeds, no errors (pre-existing unrelated dynamic-import chunking warning only).
- `npx eslint src` — 0 errors, 37 warnings, all pre-existing (`react-hooks/exhaustive-deps` on `load`/`pushToast` in unrelated seller pages; the one warning in `ProductCard.jsx` — missing `product` dep — was already present before this session's edit, carried over verbatim).
- Grepped `GiftCards.jsx`/`AddGiftCardModal.jsx` for `Amazon` — zero remaining user-facing occurrences (only the sanitizer's own regex/comment, which exists specifically to strip it from the DB's stored names at render time).
- Verified the Tailwind safelist actually reached the compiled CSS (`.from-emerald-500`, `.to-fuchsia-500`, raw `232f3e`/`131921` hex fragments all present in `dist/assets/index-*.css` post-build).
- **Not verified visually** — per every prior session in this project (1 through 17+), the Chrome browser-automation extension's `computer`/`read_page` calls fail with "Frame with ID 0 is showing error page" against this project's dev server even though `navigate`/`curl` succeed. Not retried this session; verification relied on build + lint + a live Supabase REST probe (for the gift card data shape) + manual diff review. A real `npm run dev` + browser check at 375px and desktop widths is still outstanding.

## Follow-ups for a future session

- `GiftCardBalance.jsx`/`GiftCardRedeem.jsx` already call the real `getUserGiftCardBalance`/`redeemGiftCardCode` RPCs — `GiftCards.jsx`'s own inline redeem form/balance widget still don't (deliberately left as a restyled simulation this session, per "don't touch business logic"). Wiring the landing page's widget to the same real APIs the dedicated pages already use would remove the last simulated piece of the gift-card flow.
- The Tailwind `safelist` in `tailwind.config.js` is an explicit, closed list mirroring the 23 `gift_card_designs` rows as of this session. If a new design is added with a gradient combination not already in that list, its card will render without a background gradient until the safelist is extended.
