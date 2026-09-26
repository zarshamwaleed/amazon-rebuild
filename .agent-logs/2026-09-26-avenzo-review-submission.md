# Session — Add Customer Review Submission

Date: 2026-09-26

## Goal

Reviews and star ratings were display-only. Add a working flow for a signed-in customer
to write a review with a star rating, from both the product detail page and their order
detail page, and have the product's aggregate rating/count update.

## What was built

**`src/components/WriteReviewModal.jsx` (new)** — modal taking `{ product, onClose,
onSubmitted }`. Product thumbnail/title header, interactive 5-star selector (click to set,
hover to preview), optional title input, required textarea (min 10 chars, live character
counter), Post review / Cancel buttons. Shows a "please sign in" banner (matching
`AddToRegistryModal`'s pattern) instead of the form being usable when signed out. On
submit: inserts into `reviews` via a new `createReview()` in `reviewService.js` using
`user.id` and `profile.full_name || 'Verified buyer'`, toasts "Review posted", and calls
`onSubmitted()`. Errors render inline in the modal.

**`src/services/reviewService.js`** — added `createReview(...)` (insert) and
`getReviewedProductIds(userId, productIds)` (returns a `Set` of product ids a user has
already reviewed, used to drive the "Reviewed ✓" state).

**`src/components/ReviewsList.jsx`** — added an optional `refreshKey` prop, included in the
fetch effect's dependency array, so the reviews/summary re-fetch on demand without
restructuring the component's existing self-fetching design.

**`src/pages/ProductDetails.jsx`** — in the "Reviews" info tab, added a "Write a review"
button above `ReviewsList` that opens `WriteReviewModal` for the current product. On
`onSubmitted`, bumps `reviewsRefreshKey` (so `ReviewsList` re-fetches) and re-fetches just
`{ rating, review_count }` from `products` to refresh the header rating/count shown next to
the title.

**`src/pages/OrderDetails.jsx`** — added a small "Write a review" link next to each order
item (next to the existing "Contact seller" / "Return this item" links), opening
`WriteReviewModal` for that item's product (built from the order item's
`product_id`/`product_title`/`product_image` — no extra product fetch needed). A new effect
loads `getReviewedProductIds(user.id, ...)` for the order's items on load; items already
reviewed show a static "Reviewed ✓" instead of the button, and `onSubmitted` adds the item
to that set locally so the button flips immediately without a re-fetch.

**`docs/reviews_migration.sql` (new, not run)** — see below.

## Key discoveries during implementation

- The `reviews` table and its RLS policies (public SELECT, authenticated INSERT with
  `user_id = auth.uid()`) already existed in the live database — confirmed directly via the
  Supabase REST API using the project's anon key: `GET /rest/v1/reviews` returned real rows
  with all the required columns, and an anonymous `POST /rest/v1/reviews` was correctly
  rejected with `42501 row-level security policy`. `products.rating` / `products.review_count`
  columns also already exist and are populated. So step 1–2 of the brief ("verify table/RLS,
  write a migration if missing") needed **no migration** — the table and policies are already
  correct as shipped in `docs/schema-reviews.sql`.
- What's genuinely missing is the aggregate-rating recompute. `products` has no UPDATE policy
  for regular users (only `products_public_read` exists), so a client-side
  `UPDATE products SET rating = ...` after inserting a review would be silently blocked by
  RLS. Per the brief's fallback instruction, this is done with a `SECURITY DEFINER` Postgres
  trigger (`recompute_product_rating()`, fired `AFTER INSERT OR UPDATE OR DELETE ON
  reviews`) instead, written to `docs/reviews_migration.sql`. It bypasses RLS on `products`
  via the definer's ownership rather than needing a new policy that would let arbitrary users
  edit product rows.
- `ReviewsList` already re-fetches from the DB on `productId` change and was never caching
  props — it just had no way to be told "re-fetch now" after a same-product submission,
  which the new `refreshKey` prop solves without touching its data-loading shape.

## Verification performed

- `npm run build` — succeeds, no errors.
- `npx eslint` on all changed/new files — 0 errors. One pre-existing
  `react-hooks/exhaustive-deps` warning on an unrelated effect in `ProductDetails.jsx`
  (present before this session, not touched).
- Verified live DB state directly via Supabase REST (anon key): confirmed `reviews` schema/
  RLS and `products.rating`/`review_count` columns already exist and behave as expected
  (see above) — this is why no table/RLS migration was needed, only the trigger.
- Browser automation was not attempted — per standing project history (see prior session
  logs), it has not reliably reached this project's dev server; the flow was verified by
  build + lint + direct inspection of the write path against the live schema instead.

## Follow-up for the user

**Run `docs/reviews_migration.sql` in the Supabase SQL editor** before testing — it creates
the `recompute_product_rating()` trigger function and `reviews_update_product_rating`
trigger. Without it, new reviews will insert fine and appear in `ReviewsList` (which computes
its own average directly from `reviews`), but `products.rating` / `products.review_count`
(shown in the product header and in seller-facing catalog views) will not update.

To verify end-to-end after running it: sign in as a customer, open an order, click "Write a
review" on an item, submit → review appears in the product's reviews section, item shows
"Reviewed ✓", and (on a fresh product page load) the header rating/count reflect the new
average. Sign in as a different customer on the same product → review is visible. Sign out →
reviews still render (public read, unchanged).
