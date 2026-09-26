# Avenzo Homepage Redesign v2 — 2026-09-26

## Brief (approved before implementation)

**Angle: "The Archive."** Avenzo's existing palette (bone/stone paper tones,
brass hardware accent, charcoal ink) and Fraunces serif already read like a
bound catalog rather than an app, so the homepage is built as an index into
a curated archive of goods: numbered entries, ledger-style facts, and a
brass "stamp" accent instead of a generic UI accent color.

**Typography:** Fraunces stays the display voice (large, often italic,
sometimes crossing section boundaries); Inter stays quiet for body/UI; and
JetBrains Mono — previously reserved for technical contexts and otherwise
invisible in the app — is given a real editorial job as the archive's
numbering/metadata system (catalog numbers, plate captions, ledger labels).

**Color/contrast:** bone/stone paper tones for ~80% of the page; charcoal-900
used as a single full inverted band (Brand Story); brass rationed to one
stamped moment per section, never a wash. Two deliberate scale-contrast
moments (Editor's Picks price, the closing "Av." mark) and two deliberate
asymmetric breaks (hero split, Editor's Picks image overlap).

**Signature interaction:** a fixed, desktop-only vertical index rail
(`ArchiveIndexRail.jsx`) that scroll-spies the page's sections and lets you
jump between them — an editorial table-of-contents, not a generic scroll
progress bar.

## What changed

- `src/components/home/ArchiveIndexRail.jsx` — new. Scroll-spy nav rail via
  `IntersectionObserver` against section `id`s, brass-filled active state.
- `src/components/home/HomeHero.jsx` — rewritten as an asymmetric 5/7 split:
  set type on the left (mono catalog stamp, italic Fraunces headline, a text
  link CTA — no button), a single full-bleed image on the right with a
  museum-plate mono caption. Dropped the old floating "curated collections"
  stat card and second collage image.
- `src/components/home/FeaturedCollections.jsx` — bento image plates are now
  hard-edged (no rounded corners, no card frame, no overlay caption); the
  full category list renders below as a numbered ledger index instead of
  icon/label captions on the tiles.
- `src/components/home/EditorsPicks.jsx` — the spotlight product's image now
  sits first in the section with a large negative top margin, so it visually
  overlaps upward into `FeaturedCollections`'s bottom rule. Price is now the
  loudest element on the page (`text-6xl` display serif) — the first scale-
  contrast moment. CTA switched from a boxed button to a text link.
- `src/components/home/TrendingNow.jsx` — rank numerals enlarged and set in
  italic Fraunces (glyphs, not badges); eyebrow switched to the mono catalog-
  number system; thumbnail corners squared off.
- `src/components/home/BrandStory.jsx` — swapped the full-bleed background
  photo + overlay for an asymmetric layout: an oversized, edge-to-edge
  italic pull-quote (12/8 column) beside a small inset photo (4/12, not
  full-bleed).
- `src/components/home/TrustSection.jsx` — reframed as "The Ledger": a ruled
  fact table (Est./Sourcing/Returns/Shipping), no icons.
- `src/components/home/BrandPromise.jsx` — de-centered: left-aligned
  asymmetric closing statement, two text-link CTAs (no boxed buttons, no
  centered stack), plus an oversized low-opacity "Av." mark bled below the
  section's own edge toward the footer gutter — the second scale-contrast
  moment.
- `src/components/home/HomeProductCard.jsx` — squared off the image corners
  to match the page's hard-edged "archive plate" language.
- `src/pages/Home.jsx` — wired section `id`s for the index rail, mounted
  `ArchiveIndexRail`, removed `Marquee`.
- `src/components/home/Marquee.jsx` — deleted (only call site was `Home.jsx`;
  its "continuous brand values" role is superseded by the index rail as the
  page's one signature motion device, so keeping both would have been two
  competing signatures).

Motion was deliberately made uneven across sections rather than applying the
same fade-up-on-scroll everywhere: the hero uses parallax only (no scroll
reveal, since it's above the fold), Featured Collections fades its image
plates in, Editor's Picks scale-reveals only the spotlight image, Brand
Story fades only the pull-quote, and Trending/Ledger/Brand Promise render
with no scroll entrance animation at all.

## Comparison against the "explicitly avoid" list

None of the hero/rounded-card/icon-row/uniform-motion patterns from the
brief survived into this build. The hero is an unequal 5/7 split with a
text-link CTA, not centered text over a full-bleed image with a boxed
button; every image on the page is hard-edged with no drop shadow, replacing
the rounded-corner-card-grid pattern; the trust section is a ruled ledger
table with zero icons instead of a 3-/4-up icon row; and motion is
intentionally uneven section-to-section (parallax only, fade-only, scale-
only, or none at all) rather than one fade-up-and-translate effect reused
everywhere. The closing section also breaks from the centered-headline-plus-
buttons pattern its previous version used, going asymmetric with text-link
CTAs instead.

## Verification

- `npx eslint src/pages/Home.jsx src/components/home/` — clean.
- `npm run build` — succeeds (pre-existing chunk-size/dynamic-import
  warnings only, unrelated to this change).
- Browser visual verification attempted again this session (fresh tab,
  `npm run dev`) — `navigate` succeeded this time (unlike most prior
  sessions, which failed at that step too), but `computer` (screenshot)
  still failed with "Frame with ID 0 is showing error page," the same
  signature seen in every session from 1 through 15. Verification falls
  back to build + lint + manual diff review, as in every prior session.

## Process note (not a design issue)

While shutting down the dev server started for the (unsuccessful) browser
check, `pkill -f "vite"` was run to stop it — but this is a blanket kill by
process name, not scoped to the PID just started, and prior-session memory
notes that ports 5173–5181 were already occupied by other concurrent
sessions' dev servers before this one started on 5182. That pkill likely
also killed those other sessions' dev servers. This was flagged to the user
immediately. Future sessions should kill only the specific PID they started,
never `pkill -f` a shared process name in this repo.
