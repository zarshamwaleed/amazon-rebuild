# Avenzo Design Foundations — Session 1

**Date:** 2026-09-26
**Scope:** Global design tokens and base styling only. No individual pages or components were redesigned or restructured.

## What changed

1. **`tailwind.config.js`** — extended (never overrode existing keys) with the full Avenzo token set:
   - **Colors:** `bone` (warm off-white, background), `stone` (warm neutral, secondary surfaces/borders), `charcoal` (deep neutral, primary text), `brass` (refined gold, accent — used sparingly), plus desaturated `success` / `warning` / `error` / `info` that sit comfortably in the warm palette. These are brand-new namespaces — they don't touch Tailwind's default `gray`/`yellow`/etc. scales, so nothing that currently references those classes changed appearance.
   - **Typography:** `font-display` (Fraunces, for editorial/expressive headings), `font-mono` (JetBrains Mono, technical/metadata only). `font-sans` was intentionally overridden to Inter — this is the one global cascade change, since Inter is meant to be the app's base UI/body typeface everywhere. A named `fontSize` hierarchy (`display-lg/display/display-sm`, `heading-page/heading-section/heading-sub`, `body-lg/body/body-sm`, `label`, `caption`, `price-lg/price`, `metadata`) each carries tuned line-height/letter-spacing.
   - **Spacing:** additive gap-fillers (18/22/26/30) and named section rhythm (`section-sm/section/section-lg/section-xl`) for generous editorial layouts later.
   - **Shadows:** new named tokens (`subtle/soft/card/lifted/popover/focus-ring`), warm-tinted (charcoal-based rgba, not default cool black) and deliberately restrained — none override Tailwind's default `shadow-sm/md/lg` scale that existing components use.
   - **Motion:** named durations (`fast/base/slow/slower`) and easings (`avenzo-out/in/in-out`, expo-style curves for a premium feel), plus `fade-in`, `fade-in-up`, `scale-in` keyframe/animation utilities.

2. **`index.html`** — added `<link>` tags for Fraunces, Inter, and JetBrains Mono from Google Fonts (with preconnect). Purely additive; no existing markup changed.

3. **`src/index.css`** — rebuilt the base layer:
   - `body` now sets the warm bone background, charcoal text, and Inter font family (`bg-bone-100 text-charcoal-900 font-sans`).
   - Border radius exposed as CSS custom properties (`--radius-xs` … `--radius-pill`) rather than overriding Tailwind's `rounded-*` scale, so existing `rounded`/`rounded-lg`/etc. usages are untouched until deliberately migrated.
   - Refined focus-visible state: soft two-layer box-shadow ring in brass instead of the old hard `outline: 2px solid #febd69`.
   - Warm `::selection` (brass-tinted) and a subtle warm-toned WebKit scrollbar.
   - New `@layer components` typography classes (`heading-display*`, `heading-page`, `heading-section`, `heading-sub`, `text-body*`, `text-label`, `text-caption`, `text-price*`, `text-metadata`) and a `.transition-avenzo` preset — all opt-in, all new class names, zero collisions with anything already in use.
   - All prior utility classes (`no-scrollbar`, `line-clamp-*`, `.input`) preserved as-is.

## Key decision: additive tokens, not global overrides

Every new token was added under a **new name** rather than redefining an existing Tailwind key (color scale, radius, shadow, duration). This was deliberate: components across the app (`Button.jsx`, `Card.jsx`, `Header.jsx`, `ProductCard.jsx`, etc.) already reference Tailwind's default classes directly (`bg-white`, `text-gray-900`, `bg-yellow-400`, `rounded-lg`, `shadow-sm`). Overriding those default scale values would have silently reskinned every existing page the instant this session's build ran — which conflicts with "do not redesign individual pages yet." Instead:

- The **document canvas** (body background/text/font, focus ring, selection, scrollbar) picks up the new palette immediately, since that's the literal "foundation" layer and is explicitly requested.
- **Component-level classes are untouched.** Verified that layouts (`MainLayout`, seller/sell/Prime Video layouts) each set their own explicit background (e.g. `bg-gray-50`), so the new `body` background is essentially invisible in the current app and only becomes visible as pages/components are migrated to consume the new tokens in future sessions.
- New typography, spacing, shadow, and motion tokens are available via new utility/class names (`font-display`, `text-display`, `heading-page`, `shadow-card`, `duration-slow`, `ease-avenzo-out`, `animate-fade-in-up`, etc.) ready to be adopted page by page.

## Verification

- `npm run build` — succeeds, no errors (only pre-existing warnings about dynamic/static import mixing and chunk size, unrelated to this change).
- `npm run dev` — server starts cleanly; `index.html` and compiled CSS inspected directly to confirm `body` correctly resolves to `background-color:#FAF7F1`, `color:#1B1714`, `font-family:Inter,...`, and that `--radius-*` custom properties compile as expected. Fraunces confirmed as *not* force-applied anywhere (opt-in only), as intended.
- Browser visual smoke-test via Chrome automation was attempted but the sandboxed dev server wasn't reachable from the real browser instance (network isolation) — verification was done via build output + compiled CSS inspection instead. Worth a manual look in a normal browser (`npm run dev`, visit `http://localhost:5173`) to eyeball the (subtle, mostly invisible-for-now) canvas change.
- No component or page files were modified. `git status`/diff limited to `tailwind.config.js`, `index.html`, `src/index.css`.

## Next steps (future sessions)

- Migrate shared primitives (`Button`, `Card`, `Input`, `Badge`) to consume the new tokens first, since everything else composes from them.
- Then move page-by-page (Home, Product Details, Cart/Checkout, Seller Central, etc.), applying the typography hierarchy classes and retiring the old gray/yellow Amazon palette in favor of bone/stone/charcoal/brass.
- Consider whether seller-dashboard-style pages should stay purely `font-sans` (Inter) throughout, reserving `font-display` (Fraunces) for storefront/marketing surfaces only — this session intentionally left that decision for page-level work rather than forcing it globally.
