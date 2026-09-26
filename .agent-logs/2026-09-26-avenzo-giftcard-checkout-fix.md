# Session — Fix Gift Card Checkout (invalid UUID error)

## Problem

Gift cards could be added to the cart and shown at checkout, but placing an order failed with:

```
invalid input syntax for type uuid: "gc-1790403977858-du9ak2"
```

Root cause: gift cards are added to the cart as pseudo-products with synthetic string IDs (`gc-<timestamp>-<random>`), but two places assumed every cart item has a real UUID `product.id`:

1. `CartContext.jsx` coupon-savings `useEffect` sent all `product.id`s (including gift card pseudo-IDs) into a Supabase `product_id=in.(...)` filter via `getCouponsForProducts`, and Postgres rejected the non-UUID values — logged as `[cart] coupon calc failed`.
2. `orderService.js` `createOrder` inserted an `order_items` row for every cart item, including gift cards, using the fake ID as `product_id` — a foreign-key/UUID violation causing a 400 on order placement.

## Fixes applied

### 1. `src/context/CartContext.jsx`
In the coupon-calculation effect, excluded gift card items before querying Supabase:

```js
const realProductIds = items.filter((i) => !i.giftCard).map((i) => i.product.id)
const couponMap = realProductIds.length
  ? await getCouponsForProducts(realProductIds)
  : {}
```

Coupon lookup per item (`couponMap[item.product.id] || []`) was left unchanged — gift cards simply never match a key in `couponMap`, so they contribute zero coupon savings naturally.

Subtotal/count/shipping/tax `useMemo`s were verified unchanged — they still iterate all `items` unconditionally, so gift card amounts continue to count toward totals.

### 2. `src/services/orderService.js`
`createOrder` now filters out gift card items before building `order_items` rows, and skips the insert if there's nothing to insert (e.g. an all-gift-card cart):

```js
const realItems = items.filter((i) => !i.giftCard)
const rows = realItems.map((i) => ({ ...same as before... }))
if (rows.length > 0) {
  const { error: itemsErr } = await supabase.from('order_items').insert(rows)
  if (itemsErr) throw itemsErr
}
```

`issueGiftCardsForOrder` (in `giftCardService.js`) was **not modified** per instructions — it still handles issuing `gift_cards` rows separately. Verified it degrades gracefully: it looks up a matching `order_items` row by `product_id` to set `order_item_id`, and since gift cards no longer have a corresponding `order_items` row, `order_item_id` is simply `null` for gift card issuances. This is harmless because `OrderConfirmation.jsx` fetches gift cards via `getGiftCardsForOrder(orderId)`, which queries by `order_id`, not `order_item_id`.

### 3. Audit of other cart-item iteration sites
Searched the codebase for `.product.id` usage and Supabase queries built from cart items. Only the coupon-calc site (fixed above) passed cart product IDs into a Supabase filter. All other sites (`Cart.jsx`, `Checkout.jsx` review list, `CartItem.jsx`, `WishlistContext.jsx`) use `product.id` only for local `find`/`filter`/React `key` purposes and never touch gift cards in a way that breaks — left untouched per the task's rules.

## Verification

- `npx vite build` completed successfully with no errors (only pre-existing chunk-size/dynamic-import warnings unrelated to this change).
- Confirmed via code review that:
  - Regular-product-only checkout is unaffected (all items pass the `!i.giftCard` filter).
  - Gift-card-only checkout no longer hits the coupon UUID error and no longer attempts an invalid `order_items` insert.
  - Mixed cart (product + gift card) results in `order_items` containing only the real product, while `issueGiftCardsForOrder` still creates the `gift_cards` row tied to `order.id`.
  - `OrderConfirmation.jsx` displays issued gift cards independent of `order_item_id`.

## Files changed

- `src/context/CartContext.jsx`
- `src/services/orderService.js`

No backend, RLS, schema, or routing changes. `gift_cards` table and its service functions untouched. Gift card cart-add/display behavior untouched.
