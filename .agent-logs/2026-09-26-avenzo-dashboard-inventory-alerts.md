# Session — Wire up Inventory alerts card on seller dashboard

Date: 2026-09-26

## Goal

Make the "Inventory alerts" card on `SellerDashboard.jsx` show real out-of-stock/low-stock
products (it previously always rendered its empty state). No backend/schema/routing changes.

## Changes

### `src/services/sellerService.js`
- Added `getInventoryAlerts(userId, limit = 3)` (placed just above `getSellerProducts`) —
  queries `products` for `id, title, image_url, stock, low_stock_threshold` filtered to
  `seller_id = userId`, ordered by `stock` ascending, then filters client-side to rows where
  `stock === 0` or `stock <= (low_stock_threshold ?? 5)`, sliced to `limit`. Returns `[]` on
  error or missing `userId`.
- No other service function touched. `getSellerStats`'s existing `lowStock` field (a cruder
  `stock < 5` filter with no threshold support) was left as-is and is no longer read by the
  dashboard — it may still be used elsewhere.

### `src/pages/seller/SellerDashboard.jsx`
- Imported `getInventoryAlerts`.
- Added an `inventoryAlerts` state array, fetched via `Promise.all(...)` inside the existing
  stats-loading `useEffect` (which already polls every 30s — added as a third parallel call
  alongside `getSellerStats`/`getSellerReturns`, no new interval needed).
- **Inventory alerts card**: replaced the old `stats.lowStock`-based list (title + "only N
  left" text, no thumbnail, whole-card link only) with rows built from `inventoryAlerts`:
  40x40 rounded product thumbnail (`Package` icon placeholder when `image_url` is missing,
  same pattern as `SellerInventory.jsx`), truncated title, and a status pill — `Badge
  color="red"` "Out of stock" when `stock === 0`, else `Badge color="yellow"` "Only N left".
  Each row is now its own `Link` to `/seller/inventory` (previously only the card's "Manage
  inventory →" header link navigated there). Falls back to the original empty state
  ("No inventory alerts...") when the list is empty.
- Confirmed `/seller/inventory` route exists in `App.jsx` (renders `SellerInventory`) and that
  the card's "Manage inventory →" link already pointed there — left untouched.

## Verification

- `npx eslint` on both touched files: 0 errors, 0 warnings.
- `npx vite build`: succeeded, no compile errors (only pre-existing unrelated
  chunk-size/dynamic-import warnings).
- Manual diff review: confirmed no other service functions or dashboard cards were altered.
- Did not touch backend logic, DB schema, RLS, or route definitions.
- Did not introduce mock data — reads live from Supabase via `getInventoryAlerts`.
- Browser verification skipped per established project history (see
  `avenzo-qa-pass` memory / prior session logs) — the dev browser tooling has shown
  "Frame with ID 0 is showing error page" across 13+ prior sessions; build+lint+manual diff
  review is the fallback verification path for this project.

## Notes for future sessions

- `getInventoryAlerts` duplicates the low/out-of-stock threshold logic already in
  `SellerInventory.jsx`'s `statusFor()`/filter functions (`stock <= (low_stock_threshold ||
  5)`). If a shared helper is ever extracted, unify these three call sites (dashboard card,
  inventory list `statusFor`, inventory list `low`/`out` tab filters).
- `getSellerStats`'s `lowStock` field is now dead in the dashboard (no other read sites found
  in this session) — worth removing in a future cleanup pass if confirmed unused elsewhere.
