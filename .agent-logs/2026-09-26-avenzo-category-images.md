# Better category banner images

**Approach chosen:** Option B — client-side override (no DB migration).

## What changed

- **`src/data/categoryImages.js`** (new) — maps category `slug` → curated Unsplash
  image URL (`w=1600&q=80`). `getCategoryImageOverride(slug)` returns the override
  URL or `null` if the slug has no entry.
- **`src/components/CategoryHeroBanner.jsx`** — now accepts a `categorySlug` prop.
  Resolves the displayed image as `getCategoryImageOverride(categorySlug) || image`,
  so any category without an override falls straight back to the DB's `image_url`
  exactly as before. No other behavior changed.
- **`src/pages/Category.jsx`** / **`src/pages/Products.jsx`** — both pass
  `categorySlug={category?.slug}` / `categorySlug={activeCategory?.slug}` alongside
  the existing `image={...}` prop.

Nothing in `categoryService.js`, routing, contexts, or hooks was touched.

## Image choices

Each candidate was fetched and visually checked (cropped to the banner's ~5:1
aspect ratio) before being finalized, specifically for: horizontal crop safety,
a calmer left two-fifths (where the title/breadcrumb/gradient sit), and stronger
visual interest toward the right two-thirds.

| Slug | Subject | URL |
|---|---|---|
| `electronics` | Studio still-life, black headphones on bold yellow ground | `photo-1505740420928-5e560c06d30e` |
| `books` | Warm, lit library aisle with receding shelves | `photo-1481627834876-b7833e8f5570` |
| `home-kitchen` | Soft, naturally lit kitchen with stacked orange cookware on the right | `photo-1556911073-38141963c9e0` |
| `fashion` | Curated clothing rack against a plain cream wall (editorial retail) | `photo-1490481651871-ab68de25d43d` |
| `sports-outdoors` | Wide silhouette of runners at sunset, horizontal composition | `photo-1508609349937-5ec4ae374ebf` |
| `toys-games` | Colorful pile of toy building bricks | `photo-1558877385-81a1c7e67d72` |

All six URLs were verified to return HTTP 200 before being wired in.

Several other candidates (busy fashion/editorial shots with a colorful bag on
the left, distant library shots that were sharp-and-cluttered on the left, a
kitchen exterior shot, several toy/product close-ups that turned out mislabeled
or off-topic) were previewed and rejected for fighting the left-side text
legibility or not matching the category.

## Verification

- `npx eslint` on all four changed/new files — clean.
- `npm run build` — succeeds (pre-existing "chunk larger than 500kB" warning only,
  unrelated to this change).
- Browser screenshot verification was **not possible** — the Chrome extension
  shows "Frame with ID 0 is showing error page" on this project's dev server,
  a known unresolved issue across prior sessions (see project memory
  `avenzo-qa-pass`). `curl` confirmed the dev server itself serves
  `/category/electronics` with HTTP 200.
- Not independently verified in-browser: `/category/electronics`,
  `/category/books`, `/category/sports-outdoors` render the new images. Please
  spot-check these once you have a working browser session.

## Rollback

No DB changes were made. To revert, delete `src/data/categoryImages.js` and
remove the `categorySlug` prop from `CategoryHeroBanner` + its two call sites —
banners will fall back to whatever `image_url` is already in the `categories`
table.
