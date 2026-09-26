# Category Hero Banner Fix — 2026-09-26

## Problem

`CategoryHeader.jsx` (shared by `Category.jsx`, `Products.jsx`, `SearchResults.jsx`) used a hard `md:h-[220px]` fixed-height grid row. When breadcrumb + eyebrow + title + description content exceeded that height, the title clipped instead of the container growing. The image column also fought the same fixed height inside extra `p-3`/`p-4` padding, cropping images awkwardly instead of filling the column edge-to-edge.

## Fix

Rewrote `src/components/CategoryHeader.jsx`:

- Replaced the fixed `md:h-[220px]` grid with a `min-height`-based flex row (`md:min-h-[220px] lg:min-h-[280px]`) so the banner grows instead of clipping if the title wraps.
- Removed `overflow-hidden` from the outer container entirely — it's now scoped only to the image column, so the text column can never be clipped.
- Title: `line-clamp-1` → `line-clamp-2` (wraps gracefully instead of being force-cut), kept `leading-[1.05]`, responsive sizing `text-[2rem]` (mobile) → `md:text-[2.25rem]` (tablet) → `lg:text-[3rem]` (desktop).
- Image column: removed the inner padding wrapper, image now fills its column edge-to-edge with `object-cover`, own rounded corners (`rounded-t-2xl` on mobile top, `md:rounded-r-2xl` on tablet/desktop right) matching the container's 16px radius, no dark overlay (none existed).
- Layout: `flex flex-col md:flex-row` with `order-*` utilities — mobile stacks image on top (`aspect-[16/9]`) then text below (`p-5`-equivalent via `px-5 py-6`); tablet/desktop go side-by-side, image column pinned to `md:w-[45%]` so text takes the remaining ~55%.
- No-image fallback: monogram now sits on a solid `bg-bone-200` (warm bone, per spec) instead of a gradient, sized up (`text-[3.5rem] md:text-[4.5rem]`) to read as "large."
- Container keeps `rounded-2xl border border-stone-200/80 bg-bone-100` (hairline border + warm bone background), unchanged token usage.

No changes were needed in `Category.jsx`, `Products.jsx`, or `SearchResults.jsx` — all three already consumed the single shared `CategoryHeader` component, so the fix applies uniformly.

## Verification

- `npm run build` — succeeds, no errors (only a pre-existing chunk-size warning unrelated to this change).
- `npx eslint src/components/CategoryHeader.jsx` — clean, no warnings/errors.
- Confirmed via `grep` that only `Category.jsx`, `Products.jsx`, `SearchResults.jsx`, and `CategoryHeader.jsx` itself reference the component — no other hero markup to fix.
- **Browser visual verification not possible this session**: `claude-in-chrome` screenshot calls returned `"Frame with ID 0 is showing error page"` on every attempt (both `localhost` and `127.0.0.1`), consistent with the same unresolved issue logged across prior sessions (see project memory `avenzo-qa-pass`). Relied on build + lint + manual code review instead.

## Not touched (per rules)

Backend, database, services, context, hooks, api, routing, and business logic were left untouched. No mock data introduced — image URLs still come from `category.image_url` / `activeCategory.image_url` exactly as before.
