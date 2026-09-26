# Session — Avenzo Navigation Fix (2026-09-26)

## Goal

The Avenzo header redesign (Session 4) removed UI access to several routes that still exist and work — `/alexa-shopping`, `/prime-video`, `/coupons`, `/coupons/my-coupons`, `/browsing-history`, `/buy-again`, `/customer-service`, `/registry`, `/gift-cards`. This session restored navigation entry points only — no routing, service, context, hook, or business-logic changes.

## Changes

**New component — `src/components/AlexaFloatingButton.jsx`**
Fixed bottom-right circular button (56px desktop / 48px mobile), dark ink background with a Sparkles icon, brass-tinted border, lifted shadow with hover/active/focus-visible states. Hidden on `/alexa-shopping` itself and on any path starting with `/seller` or `/sell` (this also correctly excludes the public `/seller/:id` storefront route, which is nested under `MainLayout` and starts with `/seller`). Navigates to `/alexa-shopping` on click.

Note: used exact hex/rgba values from the spec (`#1A1A1A`, `#F5F2ED`, `rgba(184,149,106,0.3)`) via Tailwind arbitrary-value classes rather than `avenzo.ink`/`avenzo.canvas` tokens, since no such Tailwind color namespace exists in `tailwind.config.js` — the actual palette is `bone`/`stone`/`charcoal`/`brass`, and these hex values happen to sit almost exactly on `charcoal-900`/`bone-50`/`brass-300`.

**`src/layouts/MainLayout.jsx`** — mounts `<AlexaFloatingButton />` once, after `<Footer />`, so it appears on every customer page rendered under `MainLayout`.

**`src/components/header/HeaderNav.jsx`** — added `Prime Video` (before Today's Deals) and `Coupons` (next to Today's Deals) to the `FEATURES` array. Same pill styling/active-state logic as existing items; the row already scrolls horizontally on overflow (`overflow-x-auto no-scrollbar`), so no layout change was needed for the two extra pills.

**`src/components/header/HeaderAccount.jsx`** — extended `SIGNED_IN_LINKS` with Browsing History, Buy Again, Gift Card Balance, and Customer Service (new icons: `History`, `RefreshCw`, `Gift`, `HelpCircle`), reordered to match the requested sequence, and renamed `Messages` → `Your Messages`. Kept the existing `Your Account` entry (not in the spec's list, but removing it would have deleted the only account-settings link in this menu — preserving existing functionality per the session rules). Sign Out behavior untouched.

**`src/components/header/MobileMenu.jsx`** (the file referred to as `MobileNav.jsx` in the brief — no such file exists; this is the actual mobile drawer component) — merged the previous "Featured" and "Shop by Category" blocks into one "Shop" section (Shop All → live categories → Prime Video/Today's Deals/Coupons/Gift Cards/Registry/Sell on Avenzo), and renamed/extended the signed-in links block into a "Your Account" section with the same additions as `HeaderAccount` (kept `Your Account` → `/account` for the same reason as above). Existing focus-trap/Escape/scroll-lock behavior untouched.

**`src/components/Footer.jsx`** — added "Alexa for Shopping" → `/alexa-shopping` to the Support column. Customer Service, Gift Cards, and Registry links already existed.

## Verification

- `npx eslint` on all six changed/new files: clean.
- `npm run build`: succeeds (only pre-existing, unrelated warnings about chunk size and a dynamically+statically imported `supabase.js`).
- Manual route cross-check against `src/App.jsx`: all 9 routes named in the brief exist and are correctly reachable from the new links (`/seller/:id` public storefront route confirmed to start with `/seller`, which is why the floating button's exclusion check matters even though the private `/seller` Seller Central tree uses a different top-level route element).
- Browser automation (`mcp__claude-in-chrome__*`) is still non-functional in this environment — `tabs_context_mcp`/`navigate` both timed out, consistent with every prior session in this project (documented back to Session 1). Did not retry further; fell back to build + lint + manual diff review, per established project practice.
- **Outstanding:** a real `npm run dev` + browser check (desktop and 375px mobile width) of the floating button, both nav bars, the account dropdown, the mobile drawer, and the footer is still owed — flag this to the user, same as every prior session.

## Not touched

`src/App.jsx`, `src/services/*`, `src/context/*`, `src/hooks/*`, `api/*`, any business logic — confirmed via `git diff` before finishing.
