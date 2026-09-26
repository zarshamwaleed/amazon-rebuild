# Session — Fix seller order visibility for customer-owned orders

**Date:** 2026-09-26
**Scope:** Audit `src/services/sellerService.js` and `src/pages/seller/*` for app-level code that could prevent a seller from seeing orders placed by a *different* customer, now that the user has added Supabase RLS policies (`orders_seller_read`, `order_items_seller_read`, `addresses_seller_read`) granting sellers SELECT on orders/order_items/addresses containing their products.

## Summary

**No app-level bug was found.** Every function and page in scope was already written the correct way — resolve the seller's product IDs first (`products.seller_id = userId`), then join outward through `order_items.product_id` to `order_items.order_id`, then fetch the parent `orders` (and their `addresses`) by `id`. Nowhere does the code filter the `orders` table by `user_id`/`buyer_id`, and no page does client-side filtering that would exclude another customer's order. This is the correct pattern for a "seller reads other people's orders via product ownership" access model, and it depends entirely on the new RLS policies to actually return rows for orders the seller doesn't own — which is exactly what was missing before this session, and is now addressed on the database side per the user.

## Audit detail

### `src/services/sellerService.js`
Checked every function that touches `orders`, plus every `from('orders')` call site in the file (11 total) for a stray `.eq('user_id', ...)`/`buyer_id` filter:

- `getSellerOrders(userId)` — products → order_items → orders (`.in('id', orderIds)`, no user_id filter). Correct.
- `getSellerOrder(userId, orderId)` — products → order_items (validates seller owns at least one item in that order) → order (`.eq('id', orderId)`, no user_id filter). Correct.
- `getSellerStats(userId)` — products → order_items → orders. Correct.
- `getSellerFulfillmentQueue(userId)` — products (+ fulfillment_method) → order_items → orders, bucketed FBA/FBM. Correct.
- `getSellerCustomerInsights(userId)` — products → order_items → orders (`select('..., user_id, addresses(*)')` — `user_id` here is read-only display data for the customer-grouping key, not a filter). Correct.
- `getSellerPayments`, `getSellerReport`, `getSellerHealth`, `getSellerGrowth`, notification helpers — all follow the same products→order_items→orders pattern with no buyer-side filter.
- `updateOrderStatus(orderId, nextStatus)` — updates by `orders.id` only; relies on RLS to authorize the write. Correct (per instructions, not to be changed).

Confirmed via `grep` across the whole file: zero occurrences of `.eq('user_id', ...)` or `buyer_id` scoped to the `orders` table.

### `src/pages/seller/*`
Checked all 8 pages named in the task:

- `SellerOrders.jsx` — table shows all rows from `getSellerOrders`; customer column reads `order.addresses?.full_name`; search matches order ID / product title / `order.addresses?.full_name`; tab counts derive from `order.order_status` only.
- `SellerOrderDetail.jsx` — customer name + shipping address render from `order.addresses`; items list is `seller_items` (already scoped server-side to the seller's line items); "Your share of this order" total sums `seller_items`, not `order.total`; "Confirm Shipment" calls `updateOrderStatus`.
- `SellerDashboard.jsx` — "Recent orders" and KPI cards (Sales/Orders/Units/Sessions/Conversion) all read from `getSellerStats`, which is buyer-agnostic.
- `SellerPayments.jsx` — transactions/balances come from `getSellerPayments`; no `buyer_id`/seller-purchase filtering anywhere in the component.
- `SellerReports.jsx` — KPIs/series from `getSellerReport(userId, from, to)`, buyer-agnostic; date-range filtering unaffected.
- `SellerInventory.jsx` — "Reserved" column comes from `getSellerInventory`'s `reservedMap`, built from all non-delivered/cancelled `order_items` regardless of buyer.
- `SellerFulfillment.jsx` — FBA/FBM queues from `getSellerFulfillmentQueue`; "Advance" calls `updateOrderStatus`, no buyer check.
- `SellerAccountHealth.jsx` — order counts/cancellation rates from `getSellerHealth`, computed over all orders touching the seller's products.

Also grepped all of `src/pages/seller/` for `user.id ===`, `buyer_id`, `order.user_id`, `.user_id ===` — zero matches, confirming no page does its own client-side ownership check that would hide another customer's order.

### Schema check
`docs/schema.sql` shows a single FK from `orders.address_id → addresses.id`, so the `select('*, addresses(*)')` embeds used throughout `sellerService.js` are unambiguous for PostgREST — not a source of silent failures.

## Changes made

None. No code in `src/services/sellerService.js` or `src/pages/seller/*` needed to change — the bug was fully in the RLS layer, which the user says is already fixed. `npx eslint` on the 9 audited files returns 0 errors (7 pre-existing `react-hooks/exhaustive-deps` warnings, unrelated and unchanged). `npm run build` succeeds.

## Verification

**Not completed via browser this session.** Per [[avenzo-qa-pass]] (Session 13, 2026-09-25/26) and [[avenzo-seller-central]] (Session 12), Chrome browser automation against this project's dev server has failed identically across 13+ prior sessions ("Frame with ID 0 is showing error page" on every screenshot), and the standing guidance from that memory is to stop retrying it per-session and rely on lint/build/manual review instead. That guidance was followed here.

**Action needed from the user (or a session with working browser access) to close out the manual verification checklist from the task:**
1. Sign in as Customer A (≠ the seller), buy a product from the seller, complete checkout.
2. Sign in as the seller; confirm the order appears on `/seller/orders`, `/seller` (Recent orders), `/seller/payments`, `/seller/reports`, `/seller/inventory` (Reserved), `/seller/fulfillment`, `/seller/account-health`.
3. Confirm customer name + shipping address render on `/seller/orders/:id`.
4. Click "Confirm Shipment" as the seller; confirm the customer sees "Shipped" on `/orders/:id`.
5. Confirm no console errors / broken imports.

If any of these still fail after this session's audit (which found the app layer already correct), the most likely remaining cause is the RLS policies themselves — e.g. a policy that checks `auth.uid()` against `products.seller_id` via a subquery that doesn't account for how the seller's `user_id` relates to `products.seller_id`, or a policy on `addresses` that isn't actually being hit because the `orders` policy's `USING` clause doesn't permit the embedded read. That would need to be checked directly in the Supabase SQL editor, outside the scope (and file restrictions) of this session.
