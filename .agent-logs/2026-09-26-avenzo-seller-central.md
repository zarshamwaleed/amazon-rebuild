# Session 12 — Avenzo Seller Central redesign

**Date:** 2026-09-26
**Scope:** Full presentation redesign of the entire seller/admin experience ("Seller Central") onto the Avenzo design system, as a premium modern SaaS platform distinct from the customer marketplace shell.

## Summary

44 files redesigned (2 new shared primitives + 6 shell/dashboard files rebuilt directly + 36 pages/components across the rest of Seller Central), all presentation-only — every service/API call, hook, auth check, permission check, and business-logic branch was preserved. Work was done by the lead directly for the app shell + dashboard + one page group, then fanned out to 9 parallel background agents (each scoped to a disjoint file set) using a shared written style spec so the output reads as one system.

## What changed

### App shell (built directly, sets the pattern for everything else)
- `src/components/seller/SellerLayout.jsx` — new responsive shell: fixed light header (64px), a collapsible dark rail sidebar (260px ↔ 76px icon-only, state persisted to `localStorage`), and a mobile off-canvas drawer with backdrop + body-scroll lock. Desktop content offset uses a CSS custom property (`--seller-sidebar-w`) so the collapse transition is a single CSS transition, not a layout hack.
- `src/components/seller/SellerHeader.jsx` — Avenzo brand mark, contextual search bar, notification bell (existing `useSellerNotifications` hook wired in unchanged, restyled dropdown), inbox/help/settings/apps icon links, account dropdown. Mobile hamburger triggers the drawer; desktop button collapses/expands the rail.
- `src/components/seller/SellerSidebar.jsx` — grouped nav with icons, active-state indicator (left accent bar / brass text), expand/collapse per section, and a hover flyout for collapsed-rail mode (icon-only rail shows a floating submenu on hover instead of losing the group's children).
- `src/components/seller/MiniSalesChart.jsx` — rebuilt as a proper Avenzo chart: single brass line/area, minimal 3-line gridlines, hover crosshair + tooltip, empty state. Same public API (`data`, `height`, `formatValue`) as before, reused across the dashboard, account health, reports, and returns analytics.
- `src/components/seller/SellerPageHeader.jsx` (new) — shared page-header chrome (title, description, optional back link, actions slot) used by every seller page for a consistent header.
- `src/components/seller/SellerStatCard.jsx` (new) — shared KPI tile (label, value, icon, optional trend arrow with `invert` for "a rise is bad news" metrics like return rate) used across the dashboard, reports, payments, returns analytics, growth, and customers pages.
- `src/pages/seller/SellerDashboard.jsx` — rebuilt as the reference premium-dashboard pattern (greeting card, 5-KPI row, sales chart with period toggle, a 2-column grid of activity cards, account-health panel) — this became the template every other data-heavy page (Reports, Payments, Account Health, Returns Analytics, Growth) was asked to feel like a sibling of.
- `src/components/seller/SellerPlaceholder.jsx` and `src/pages/seller/SellerPlaceholder.jsx` — both restyled (the `components/` one was already dead code, confirmed unused; restyled anyway for consistency in case it's revived).

### Everything else (9 parallel groups, same style spec)
- **Products & Inventory** — `SellerProducts`, `SellerProductEditor` (large multi-section form), `AIListingAssistant`, `SellerInventory`.
- **Orders & Fulfillment** — `SellerOrders` (tabbed), `SellerOrderDetail`, `SellerFulfillment` (FBA/FBM tabs via query param), `SellerReturns`.
- **Returns deep flow** — `SellerReturnDetail` (~1100-line multi-state approve/deny/refund workflow), `SellerReturnsSettings`, `SellerReturnsAnalytics`.
- **Pricing & Advertising** — `SellerPricing`, `SellerAutomatePricing`, `SellerAdvertising`.
- **Marketing/engagement** — `SellerCoupons`, `SellerDeals`, `SellerReviews`, `SellerCustomers`.
- **Business ops & storefront** — `SellerReports`, `SellerPayments`, `SellerAccountHealth`, `SellerStore`, `SellerStoreBuilder`.
- **Growth** — `SellerGrowth`, `SellerGrowthOpportunity`, `AIGrowthAssistant` (chat-bubble restyle, "AI-powered" brass signal treatment).
- **Settings & Users** — `SellerSettings` (~900-line multi-section settings page, two-column nav+content layout), `SellerUsers` (roles/permissions table).
- **Communication** — `SellerMessages` (two-pane inbox), `SellerNotifications` (full list, mirrors the header bell's visual language), `SellerSupport` (help center + case creation).
- **Apps & Services** — `AppsLanding`, `Appstore`, `AppDetail`, `ManageApps`, `Providers`, `AmazonTools` (all under the real `/seller/apps-services/*` routes).

## Consistent conventions applied everywhere

- **Tables:** `bg-bone-50 border border-stone-200 rounded-xl shadow-subtle` wrapper, `bg-stone-50` head with `text-label` cells, `divide-y divide-stone-100` body rows with `hover:bg-stone-50/60`, `.skeleton-shimmer` loading rows (not "Loading…" text), shared `EmptyState` for empty results, fixed-position dropdown menus for row actions.
- **Forms:** shared `Input`/`Button` primitives throughout, `loading` state on every save action, inline field errors via `Input`'s `error` prop where per-field validation existed.
- **Status:** always via the shared `Badge` component (`color` maps to the Avenzo `success`/`warning`/`error`/`info` token scale) — never raw `red-*`/`green-*`/`amber-*` Tailwind classes.
- **Charts:** every trend visualization reuses the one `MiniSalesChart` component instead of bespoke SVG per page.
- **KPIs:** every stat-tile row reuses `SellerStatCard`.
- **Color discipline:** brass reserved for accent/CTA/active-state/"AI-powered" signal; charcoal-900 for primary buttons and dark text; bone/stone for backgrounds and borders.

## Verification performed

- `npx eslint src/pages/seller src/components/seller` → **0 errors** (25 pre-existing `react-hooks/exhaustive-deps` warnings on `load()`/`pushToast` effect dependencies — the same pattern used app-wide before this session, left untouched since fixing them would be a behavior change outside a presentation-only rewrite).
- `npx eslint src` (whole repo) → 18 errors, all confirmed via `git diff --stat` to be in files nobody touched this session (`CartContext.jsx`, `CouponsContext.jsx`, `WishlistContext.jsx`, `useRecentlyViewed.js`, `lib/utils.js`, `aiService.js`, `sellerService.js` — pre-existing issues, out of scope for this redesign).
- `npm run build` → succeeds, no broken imports.
- Grepped the entire seller tree for leftover old-palette markers (`#febd69`, `#232f3e`, `#131921`, `#c7511f`, `#007185`, `#37475a`, raw `gray-*` utility classes) → **zero matches**.
- Grepped for local components shadowing the shared `Card`/`Badge`/`EmptyState` primitives (the known "local shadow component" trap from earlier sessions, see `avenzo-design-system-rollout` memory) → **none found**.
- Extracted every internal `to="/seller/..."` link and `navigate('/seller/...')` call across all seller files and cross-checked against every declared `<Route>` in `src/App.jsx` → **all 27 unique link targets matched a real route**, including the two route-naming gotchas fixed early in the session (sidebar/header previously pointed at `/seller/apps`/`/seller/apps/*` instead of the real `/seller/apps-services/*` paths; fixed before any page-level work started).
- No browser-based click-through was performed — Chrome extension browser automation has been unreliable against this project's dev server in every prior session (see `avenzo-design-system-rollout` memory); verification relied on build + lint + route cross-check + manual diff review of the shell/dashboard files, consistent with every prior session's fallback.

## Known follow-ups for a future session

- `SellerAccountHealth.jsx`'s health-score chart and `SellerReturnsAnalytics.jsx`'s KPIs both consume `MiniSalesChart`/`SellerStatCard` — not independently visually verified in a running browser, only build/lint-verified.
- The customer-facing `OrderStatusBadge`/`OrderStatusTimeline` components (already Avenzo-styled from Session 9) are reused as-is by `SellerOrderDetail.jsx`/`SellerReturnDetail.jsx` — deliberately not touched again this session.
- A real `npm run dev` + browser click-through of Seller Central (dashboard → products → orders → returns → settings → apps) is still outstanding, same caveat as every customer-side session before it.
