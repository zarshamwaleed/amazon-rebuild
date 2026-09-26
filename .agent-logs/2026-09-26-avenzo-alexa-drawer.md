# Avenzo Alexa — Slide-in Drawer (2026-09-26)

## Goal
Convert the floating Alexa button from a full-page navigation (`/alexa-shopping`) into a right-side slide-in drawer, with an expand affordance to the full page and a collapse affordance back. No backend/service/hook/routing/business-logic changes.

## Files changed
- `src/components/AlexaChatPanel.jsx` **(new)** — chat UI (messages, composer, mic, suggestions) extracted verbatim from `AlexaShopping.jsx`, unchanged behavior. Accepts an optional `onCatalogLoadingChange` callback so the full page can still show its "Loading catalog…" hero status without duplicating the catalog-fetch effect.
- `src/components/AlexaDrawer.jsx` **(new)** — fixed overlay + right-side panel (420px desktop / full-width mobile), backdrop click + Escape to close, Maximize2 button to expand to `/alexa-shopping`, X to close. Panel stays mounted at all times (visually toggled via `translate-x-full`/`invisible`) so `AlexaChatPanel`'s message/input state survives open→close→open cycles within a session.
- `src/components/AlexaFloatingButton.jsx` **(rewrite)** — no longer navigates; calls `onOpen()` prop. Added `hidden` prop so it disappears while the drawer is open. Still hides itself on `/alexa-shopping`, `/seller/*`, `/sell/*` (pre-existing guard, unchanged).
- `src/pages/AlexaShopping.jsx` **(refactor)** — hero/banner kept as-is; chat body now renders `<AlexaChatPanel onCatalogLoadingChange={setCatalogLoading} />` instead of inlining the chat. Added a Minimize2 "collapse" icon button in the hero that does `navigate(-1)` when there's browser history (`window.history.state?.idx > 0`), else `navigate('/')`.
- `src/layouts/MainLayout.jsx` — added `alexaOpen` state, mounts `<AlexaDrawer open={alexaOpen} onClose={...} />` and passes `onOpen`/`hidden` to the floating button. Drawer is not mounted on `/alexa-shopping`, `/seller/*`, `/sell/*` (mirrors the floating button's own route guard).

`src/services/alexaService.js` — untouched; no signature or behavior changes.

## Notes / deviations
- Requirement 10 ("chat state should not be lost when the drawer is open") was interpreted as: state must survive drawer close→reopen within the same session (not just while open), since the spec explicitly says it doesn't need to survive a full-page navigation. Implemented by keeping `AlexaChatPanel` permanently mounted inside `AlexaDrawer` rather than conditionally rendering it on `open`.
- Drawer animation timings follow the spec (`200ms` backdrop fade, `300ms` cubic-bezier(0.22,1,0.36,1) panel slide) using Tailwind's existing `duration-base` (200ms) token plus one arbitrary-value duration for the panel, since no existing token matched 300ms exactly.
- Design tokens referenced in the brief (`avenzo.canvas`/`ink`/`brass`/`border`) map to this repo's actual Tailwind tokens: `bone-50` (canvas), `charcoal-900` (ink), `brass-500` (brass), `stone-200` (border) — used those directly to stay consistent with the rest of the codebase (e.g. `MobileMenu.jsx`, which this drawer's structure/pattern was modeled on: fixed overlay, backdrop click-to-close, Escape handler, body scroll-lock, `role="dialog"`/`aria-modal`).

## Verification
- `npm run build` — succeeds, no errors (pre-existing "large chunk" warning only, unrelated to this change).
- `npx eslint` on all 5 changed/new files — no errors or warnings.
- Manual diff review of all files — no stray imports, no broken references; `AlexaFloatingButton` was confirmed to be mounted only in `MainLayout` (single integration point).
- **Browser verification was not possible this session.** The Chrome automation tool returned `Frame with ID 0 is showing error page` on every screenshot attempt against the local dev server (port 5184), reproducing the same failure logged in prior sessions ([[avenzo-qa-pass]] memory — 13+ sessions with this exact symptom). Followed that memory's guidance: stopped retrying and relied on build + lint + manual diff review instead. **This change has not been visually confirmed in a real browser** — worth a manual click-through (drawer open/close, Escape, backdrop click, expand/collapse, mobile width) next time the browser tool is working.

## Cleanup
Dev server (`vite`, port 5184) stopped at the end of the session.
