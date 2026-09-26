# Avenzo Category Hero + Product Card Fix — 2026-09-26

## Scope
Fixed the category/products/search hero height and modernized the product card + grid. No backend/services/context/hooks/api/routing touched.

## Fix 1 — Compact horizontal hero (`CategoryHeader.jsx`)
- Rebuilt as a fixed-height band: `md:h-[220px]` (within the requested ~200–260px range) vs. the previous full `aspect-[4/3]`-image layout that pushed products off-screen.
- Left column: breadcrumb → eyebrow → title → description, vertically centered, no wasted whitespace.
- Right column: narrow ~40%-width image (or Fraunces monogram fallback), inset with padding, filling the fixed hero height — now genuinely horizontal instead of a tall portrait block.
- Title dropped from `text-[3.5rem]` (56px) to `md:text-[2.75rem]` (44px), within the requested 40–48px range.
- Removed the "N results" line from inside the hero — it was duplicated with the item-count text already shown in the row above the grid (avoids the double count).
- `title`/`eyebrow` now accept JSX (not just strings), and a new optional `monogramLabel` prop drives the image-fallback monogram when `title` isn't a plain string.
- Applied to and shared by `Category.jsx`, `Products.jsx`, **and** `SearchResults.jsx` (previously `SearchResults.jsx` hand-rolled its own near-duplicate hero markup — now consolidated onto the same component, closing a gap flagged in the prior QA-pass memory).
- `SearchResults.jsx` gained the same "N results" + sort row directly below its hero that `Category`/`Products` already had (was previously missing entirely).

## Fix 2 — Product card polish (`ProductCard.jsx`)
The card already had most of the target treatment from an earlier redesign session; tightened it to match the spec precisely:
- Outer radius `rounded-2xl` → `rounded-xl` (12px, as specified).
- Card hover transition now explicit `duration-300 ease-out` (previously the shared `transition-avenzo` utility, which resolves to 200ms) — lift (`-translate-y-1` = 4px) + border + shadow all animate on the same 300ms timing; image hover-scale (`scale-[1.04]`) also moved to `duration-300 ease-out`.
- Wishlist button background opacity `70%` → `90%` per spec.
- Quick-add bar label changed from "Quick add" to "Add to Cart"; its slide-up transition set to an explicit `duration-200 ease-out`.
- Brand line font-size pinned to `text-[11px]` (was the shared `av-label` token at 13px).
- Price font-size pinned to `text-[22px]` Fraunces (was `text-xl`/20px).
- Discount badge, rating stars, star-count muted color, and hover-lift/scale behavior were already correct and left as-is.

## Fix 3 — Grid (`ProductGrid.jsx`)
- Gap changed from the responsive `gap-3.5 sm:gap-5` to the fixed `gap-x-5 gap-y-8` requested.
- `Category.jsx`, `Products.jsx`, `SearchResults.jsx` now pass `cols={4}` instead of `cols={3}`, so all three get the full `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` responsive layout the grid component already supported by default (it just wasn't being requested by these pages).

## Verify
1. `npm run build` — succeeds, no errors (pre-existing large-chunk warning only, unrelated).
2. `npx eslint` on all changed files — 0 errors, 1 pre-existing unrelated warning in `ProductCard.jsx` (`useEffect` exhaustive-deps, present before this session's changes).
3. Browser visual verification was **not possible** — Chrome MCP tooling has returned "Frame with ID 0 is showing error page" on every screenshot attempt across 13+ prior sessions per project memory (`avenzo-qa-pass.md`); this is a known, previously-diagnosed environment issue, not something introduced this session. Verified instead via build success + manual review of the Tailwind class math (hero height budget, grid column math against the `w-64` sidebar, contrast/spacing tokens against the existing design-token scale).
4. Preserved all existing product data, filters, sorting, pagination, and links — no changes to `services/`, `context/`, hooks, or routing.

## Files changed
- `src/components/CategoryHeader.jsx` (rewritten)
- `src/components/ProductCard.jsx`
- `src/components/ProductGrid.jsx`
- `src/pages/Category.jsx`
- `src/pages/Products.jsx`
- `src/pages/SearchResults.jsx`
