# Avenzo Prime Video Redesign — 2026-09-26

## Scope

Full visual redesign of the Prime Video section from an Amazon-clone dark UI into an
editorial, cinematic "Avenzo Studio" destination — warm dark palette, Fraunces display
type, restrained motion. Presentation only; no backend/service/context/routing changes.

Files touched (all within the allowed set):
- `src/pages/prime-video/PVLayout.jsx`
- `src/pages/prime-video/PVHome.jsx`
- `src/pages/prime-video/PVMovies.jsx`
- `src/pages/prime-video/PVTV.jsx`
- `src/pages/prime-video/PVMyStuff.jsx`
- `src/pages/prime-video/PVSearch.jsx`
- `src/pages/prime-video/PVWatch.jsx`
- `src/components/prime-video/PVHero.jsx`
- `src/components/prime-video/VideoCard.jsx`
- `src/components/prime-video/VideoRow.jsx`

No other files were modified. `tailwind.config.js` and `src/index.css` were deliberately
left untouched (out of scope) — see Palette note below.

## Palette implementation

The brief's exact hex values (`#14100E` ink, `#1E1917` surface, `#2A2422` surface-alt,
`#F5F2ED` bone, `#A8A29A` muted, `rgba(245,242,237,.08)` border, `#B8956A` brass) don't
match the pre-existing `charcoal-*`/`brass-*` Tailwind tokens closely enough to reuse
those scales, and editing `tailwind.config.js` would affect Seller Central and other
consumers of those tokens outside this task's scope. Instead, `PVLayout.jsx` defines the
palette as CSS custom properties scoped to a `.pv-scope` wrapper (via an inline `<style>`
tag, since PVLayout is the single shared ancestor for every Prime Video route), and every
downstream component/page references them as Tailwind arbitrary values, e.g.
`bg-[var(--ink)]`, `text-[var(--brass)]`, `border-[var(--border)]`. Opacity modifiers
(`text-[var(--bone)]/80`) rely on Tailwind 3.4's `color-mix()` support for arbitrary CSS
variables — confirmed the project is on `tailwindcss ^3.4.19`, so this is supported.

The same `<style>` block also defines the Ken Burns keyframe (`pv-kenburns`, 12s
scale 1→1.06, ease-out, alternate/infinite) and the edge-fade mask utility (`pv-fade-x`,
used by `VideoRow`'s horizontal scroller and the mobile nav strip).

## Notable deviations from the literal brief (judgment calls)

- **No autoplaying video anywhere.** The pre-existing `PVHero` and `VideoCard` both
  autoplayed muted preview clips (hero via `autoPlay`+`IntersectionObserver`, cards via
  scroll-into-view). The brief's own Motion rules say "no auto-playing video unless
  hovered," and neither detailed component section (Hero, VideoCard) actually describes a
  video element — Hero calls for "a full-bleed backdrop image with subtle Ken Burns zoom,"
  and VideoCard's hover spec is poster + overlay + play icon, no preview clip. Both
  components were simplified to poster/backdrop images only, dropping the `<video>`,
  `IntersectionObserver`, and mute-toggle machinery entirely (the hero no longer has a
  volume icon, since there's no audio source to control). `videoUrl`/`previewUrl` data is
  untouched — only `PVWatch.jsx` (the actual watch page) still plays video.
- **Shared `EmptyState` component dropped from PV pages.** `EmptyState.jsx` is
  light-themed (bone-50 background, charcoal text) and was previously used as-is inside
  the dark PV pages (`PVMyStuff`, `PVSearch`, `PVWatch`'s not-found branch) — a visible
  light box on a dark cinematic page. Replaced with small inline dark-themed empty states
  local to each file (not a new shared component, not a change to `EmptyState.jsx`
  itself), matching the brief's "centered, editorial" search empty-state spec and
  extended to the other two empty states for consistency.
- **Nav items** changed from `Home / Movies / TV Shows / Sports` to the brief's
  `Home / Movies / TV Shows / My Stuff` — `/prime-video/sports` still exists as a route
  (renders `PVSimple`, out of scope) but is no longer linked from the nav, per the brief's
  explicit 4-item list.
- **Filter pills on Movies/TV** are a new small piece of local UI state (genre selection)
  since no such state pre-existed — client-side filtering over the already-loaded static
  catalog, not a service/data change. "All" shows the original curated rows; any other
  genre swaps to a responsive grid.
- **"Editor's Picks" row on Home** has no dedicated data-layer function (`catalog.js` was
  left untouched), so it's derived in `PVHome.jsx` as a client-side filter over `TITLES`
  (Drama/Mystery/Thriller genres, excluding the hero title).

## Verification

- `npx eslint src/pages/prime-video src/components/prime-video` — clean, no warnings.
- `npm run build` — succeeds (`vite build`, 12.6s); only pre-existing, unrelated warnings
  (dynamic/static import overlap on `supabase.js`, >500kB main chunk) — both present
  before this session's changes.
- Browser verification attempted via the Chrome extension (`npm run dev` on port 5182,
  since 5173–5181 were already bound by other background dev servers). `navigate` and
  `tabs_context_mcp` succeeded; `curl` confirmed a 200 response from the dev server; but
  `computer` screenshot failed every time with "Frame with ID 0 is showing error page" —
  the same unresolved extension/sandbox limitation logged in every prior session
  (Sessions 1–13). `read_console_messages` reported no runtime errors on the page. Visual
  verification therefore still relies on build + lint + manual JSX/Tailwind review; a real
  browser check (`npm run dev` → `/prime-video`) remains outstanding for the user.
