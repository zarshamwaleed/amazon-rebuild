# Avenzo Core UI Primitives — Session 2

**Date:** 2026-09-26
**Scope:** Redesign the seven reusable UI primitives (`Button`, `Input`, `Card`, `Badge`, `ErrorBoundary`, `LoadingSkeleton`, `EmptyState`) to consume the Avenzo tokens established in Session 1. No pages were redesigned.

## Pre-work: usage audit

Before touching any component, every call site across the app (24 files) was audited for the exact props each primitive is actually called with, since these are shared components used throughout the app:

- **Button** — always `variant` + `className` + native props (`onClick`, `disabled`, `type`). No caller used `size` or `loading` (new props are additive).
- **Input** — always `label` / `hint` / `error` + native props. No caller used `loading` (new prop is additive).
- **EmptyState** — every one of ~40 call sites passes only `title` and/or `message`. `icon` and `action` are new, additive, and default to sensible values so nothing regresses visually beyond gaining an icon.
- **LoadingSkeleton** — always `count` (+ occasionally `cols`). API unchanged.
- **Card** and **Badge** — `Card` turned out to be imported nowhere; every "card" in the app (e.g. `SellerStoreBuilder.jsx`) is a locally-defined function of the same name that shadows the import. `Badge` is used in exactly one place, `OrderStatusBadge.jsx`, via `<Badge color={s.color}>`, with `color` always one of `gray | green | red | yellow | blue`. Both signatures were redesigned freely for `Card` and kept 100% backward compatible for `Badge`'s `color` prop.
- **ErrorBoundary** — wraps the app in `App.jsx`; behavior (state, `componentDidCatch`, reload-on-click) had to stay untouched — visuals only.

## What changed

### `src/components/Button.jsx`
Full variant/size system: `primary | secondary | ghost | danger | outline` × `sm | md | lg`, built on Avenzo tokens (`charcoal`, `brass`, `stone`, `error`). Motion via the shared `.transition-avenzo` preset plus `active:scale-[0.98]` for tactile press feedback (disabled while `disabled`/`loading`). New optional `loading` prop shows a spinning `Loader2` icon, sets `aria-busy`, and disables the button — fully additive, no caller passes it today. Removed the old `focus:ring-*` utilities tied to the pre-Avenzo gray palette; buttons now rely on the global warm focus-visible ring added to `index.css` in Session 1.

### `src/components/Input.jsx`
Restyled to warm `bone`/`stone`/`charcoal` tokens with a `brass` focus border. Label now uses the `.text-label` (uppercase, tracked) typography class; hint/error use `.text-caption`. New optional `loading` prop renders a small spinner inside the field and disables it — additive, matches the "loading state where appropriate" ask without being forced onto any existing form.

### `src/components/Card.jsx`
Rebuilt as a real card system: optional `title` / `subtitle` / `actions` header (with a hairline bottom border), optional `footer` (hairline top border, warm `stone-50` tint), a `padding` scale (`none | sm | md | lg`), and an optional `hoverable` lift (`shadow-subtle` → `shadow-soft` on hover). Uses `rounded-xl` (12px) rather than a heavy/floating radius, per the "don't over-round" instruction. Was unused anywhere in the app, so the API was designed fresh rather than shimmed for backward compatibility.

### `src/components/Badge.jsx`
Kept the exact `color` prop contract (`gray | green | red | yellow | blue`) that `OrderStatusBadge.jsx` depends on, remapped to Avenzo's desaturated `success`/`warning`/`error`/`info`/`stone` tones. Added an opt-in `variant` prop: `pill` (default, same shape as before), `chip` (rounded-md, slightly denser), and `dot` (a small status dot + label, no fill background) — restrained color use, only for state/status communication.

### `src/components/LoadingSkeleton.jsx`
Kept the `count`/`cols` API. Replaced the flat `animate-pulse` blocks with a warm shimmer sweep (new `.skeleton-shimmer` class in `index.css`, driven by a `@keyframes shimmer` background-position animation across a `stone-100 → stone-50 → stone-100` gradient) for a more premium loading feel.

### `src/components/EmptyState.jsx`
Kept `title`/`message` as the only required API. Added an editorial layout: a soft icon medallion (`Inbox` from `lucide-react` by default, overridable via `icon`), `heading-sub` title, `text-body-sm` message, and an optional `action` slot for a CTA (e.g. a `<Button>`). Dashed hairline border on a warm surface, distinguishing it from `Card`'s solid-border surface.

### `src/components/ErrorBoundary.jsx`
Visual-only change. Reused the new `Button` component for the reload action (instead of a hand-rolled button), added an `AlertTriangle` icon in a soft `error`-tinted medallion, and switched typography/colors to the Avenzo tokens. `getDerivedStateFromError`, `componentDidCatch`, and the `window.location.reload()` behavior are untouched.

### `src/index.css`
Added `.skeleton-shimmer` + a `@keyframes shimmer` rule (additive, new class name, no collisions).

### `tailwind.config.js` — bug fix
While wiring up `EmptyState`/`ErrorBoundary`/`Input` to the `.text-body-sm` / `.text-label` / `.text-caption` typography helpers from Session 1, the production build failed:

```
[postcss] You cannot @apply the `text-body-sm` utility here because it creates a circular dependency.
```

Root cause: Session 1's `fontSize` tokens were named `body`, `body-sm`, `label`, `caption`, `price`, etc., which Tailwind turns into utilities named `text-body`, `text-body-sm`, `text-label`, `text-caption`, `text-price` — **identical** to the component-layer class names (`.text-body`, `.text-label`, ...) in `index.css` that `@apply` them. That's a self-referential `@apply`. It was latent and silent in Session 1 because nothing in the codebase used those component classes yet, so Tailwind never had to resolve the reference. This session is the first real consumer, so it surfaced immediately.

Fix: renamed the colliding `fontSize` keys to an `av-` prefix (`av-body`, `av-body-sm`, `av-label`, `av-caption`, `av-price`, `av-price-lg`, `av-metadata`) and updated the corresponding `@apply` lines in `index.css`. The public API — the `.text-body-sm`, `.text-label`, `.text-caption`, etc. component classes used in JSX — is unchanged; only the internal fontSize token names (which nothing outside `index.css` referenced) moved.

## Verification

- `npm run build` — succeeds (`vite build`, exit 0). Only pre-existing warnings (dynamic/static import mixing, chunk size) unrelated to this change.
- `npx eslint` on all seven edited components — clean. (Repo-wide `npm run lint` has ~94 pre-existing errors in unrelated files, none touched this session.)
- One eslint false-positive was hit and fixed along the way: `EmptyState`'s `icon: Icon = Inbox` destructure-with-rename-and-default pattern tripped `no-unused-vars` on `Icon` despite being used in JSX (no `eslint-plugin-react` is configured in this repo, so JSX-usage tracking is thinner than usual). Rewrote as `icon = Inbox` + `const Icon = icon` inside the body, which lints clean.
- Browser visual smoke-test via Chrome automation was attempted (dev server started on port 5183) but the extension/tab-context calls did not respond in this sandbox — same limitation Session 1 hit. Verification here relied on build output, targeted `git diff` review of every changed file, and the up-front usage audit confirming no existing caller's props/behavior changed. Worth a manual look in a real browser (`npm run dev`) to eyeball Button states, the Input focus ring, Card header/footer, Badge variants, the skeleton shimmer, and the EmptyState/ErrorBoundary layouts.

## Backward compatibility summary

| Component | Existing callers affected? | New props added |
|---|---|---|
| Button | No — `variant`/`className`/native props unchanged | `size`, `loading` |
| Input | No — `label`/`hint`/`error`/native props unchanged | `loading` |
| Card | N/A — was unused anywhere in the app | full new API (`title`, `subtitle`, `actions`, `footer`, `padding`, `hoverable`) |
| Badge | No — `color` values (`gray/green/red/yellow/blue`) unchanged | `variant` (`pill`/`chip`/`dot`) |
| LoadingSkeleton | No — `count`/`cols` unchanged | — (visual only) |
| EmptyState | No — `title`/`message` unchanged | `icon`, `action` |
| ErrorBoundary | No — lifecycle/behavior unchanged | — (visual only) |

## Next steps (future sessions)

- Now that the primitives exist, page-by-page migration (Home, Product Details, Cart/Checkout, Seller Central, etc.) can start swapping in `Card`/`Badge` where pages currently hand-roll their own local equivalents (e.g. `SellerStoreBuilder.jsx`'s local `Card`, several seller pages' local `EmptyState`, `MyReturns.jsx`'s inline status-color maps that could become `Badge` with `variant="dot"`).
- Consider whether `Button`'s `loading` prop should be wired into `Checkout.jsx`'s "Placing order…" text-swap pattern instead of the current manual `{placing ? '...' : '...'}`, once that page is in scope for redesign.
