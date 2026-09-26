# Category Hero: Full-Bleed Image Banner — 2026-09-26

## What changed

Replaced the split image-column/text-column `CategoryHeader.jsx` (from the earlier same-day hero fix) with a new **full-bleed single-image banner**, `src/components/CategoryHeroBanner.jsx`, per an exact spec: one edge-to-edge image, one left-to-right dark gradient overlay, text on the left, result count on the far right. No split layout, no white panel behind the text.

`src/pages/Category.jsx`, `src/pages/Products.jsx`, `src/pages/SearchResults.jsx` all now import and render `CategoryHeroBanner` instead of `CategoryHeader`. `src/components/CategoryHeader.jsx` had zero other call sites (grep-confirmed) so it was deleted rather than left as dead code.

## Component details (`CategoryHeroBanner.jsx`)

- **Container**: `h-[180px] md:h-[200px] lg:h-[240px]`, `rounded-[14px]`, `overflow-hidden`, `relative`. Fixed height (not min-height, unlike the prior version) — safe here because the text column truncates to one line per element instead of wrapping.
- **Image**: `absolute inset-0 w-full h-full object-cover`, from `category.image_url` / `activeCategory.image_url` — no mock data, no change to data fetching.
- **Gradient**: exact spec stops via inline `style` (`linear-gradient(to right, rgba(20,20,20,.65) 0%, rgba(20,20,20,.25) 50%, rgba(20,20,20,.05) 100%)`) — Tailwind's arbitrary-gradient utilities can't express a 3-stop gradient with exact rgba stops cleanly, so this one case uses inline CSS rather than a token.
- **Text column**: `absolute inset-y-0 left-0` **and** `right-24 md:right-28 lg:right-36` (not just `max-w`) — combining left+right offsets gives the element a real computed width, which is what makes `truncate` (ellipsis) actually engage on long category names/descriptions instead of silently shrinking-to-fit and never overflowing. `max-w-[560px]` further caps it on wide screens. Padding-left `pl-5`/`md:pl-6`/`lg:pl-10` matches the spec's 20/24/40px exactly.
- **Breadcrumb → eyebrow ("CATEGORY") → Fraunces title → description**, each `truncate`d to one line — avoids the vertical-clipping failure mode the same-day earlier `CategoryHeader` fix (`.agent-logs/2026-09-26-avenzo-category-hero-fix.md`) had to work around with `min-height`; here it's solved by never letting any line wrap instead.
- **Result count**: absolutely positioned right, vertically centered, `pr` 20/24/40px across breakpoints, only rendered when a numeric `resultCount` prop is passed.
- **No-image fallback**: per the rules section (not the main spec, since none of the 4 sample categories currently lack `image_url`), a warm `bone-200→bone-100→bone-300` gradient background with a large italic Fraunces monogram in `brass-400/50`, positioned right — and text switches from bone/brass-on-dark to charcoal/brass-on-light so it stays legible against the light fallback.

## Prop contract

`{ title, description, eyebrow = 'Category', image, breadcrumb, monogramLabel, resultCount }` — `breadcrumb` keeps the same `[{ label, to? }]` shape the old component used, so no page had to change how it builds breadcrumbs. New: `resultCount` (was a dead `count` prop on the old `CategoryHeader` — never actually read/rendered anywhere; renamed and wired up here, and also named to match `FilterSidebar`'s existing `resultCount` prop for consistency).

- `Category.jsx` / `Products.jsx`: swapped their pre-existing (dead) `count={total}` prop to `resultCount={total}`.
- `SearchResults.jsx`: didn't pass a count before at all — now passes `resultCount={q ? total : undefined}` and a short static description line (`"Showing matches across our catalog"`, shown only when there's an active query) so the search hero has the same four content rows as the other two pages. No new data fetching — `total` was already being computed by the page's existing `searchProducts()` call.

## Verification

- `npm run build` — succeeds (only the pre-existing >500kB chunk-size warning, unrelated to this change).
- `npx eslint` on all 4 touched/added files — clean.
- `grep -rn "CategoryHeader" src/` — no references remain after deletion.
- **Browser visual verification not possible this session** — same `claude-in-chrome` "Frame with ID 0 is showing error page" failure logged in every prior session for this project (see `avenzo-design-system-rollout` / `avenzo-qa-pass` memory); not retried per the established "permanent environment limitation" note. Relied on build + lint + manual review of the Tailwind classes/spec mapping above.

## Not touched (per rules)

Backend, database, services, context, hooks, api, routing, and business logic untouched. No mock data introduced — `image_url` still flows straight from the categories table through to `CategoryHeroBanner`'s `image` prop exactly as before.
