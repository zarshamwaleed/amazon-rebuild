-- ============================================
-- Review submission: aggregate rating trigger
-- ============================================
-- The `reviews` table, its public-read policy, and its
-- "authenticated users insert their own review" policy already
-- exist (see docs/schema-reviews.sql). This migration only adds
-- the piece needed for customer-submitted reviews to update the
-- product's aggregate rating/review_count.
--
-- The trigger function is SECURITY DEFINER because regular users
-- have no UPDATE policy on public.products (by design — only
-- sellers/admin can edit product rows), so a client-side update
-- would be blocked by RLS. The trigger recomputes the aggregate
-- server-side whenever a review is inserted, updated, or deleted.

create or replace function public.recompute_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  target_id := coalesce(new.product_id, old.product_id);

  update public.products
  set
    rating = coalesce((select avg(rating) from public.reviews where product_id = target_id), 0),
    review_count = (select count(*) from public.reviews where product_id = target_id)
  where id = target_id;

  return null;
end;
$$;

drop trigger if exists reviews_update_product_rating on public.reviews;
create trigger reviews_update_product_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_product_rating();
