-- ============================================================
-- Seller order actions: Print Shipping Label / Refund / Contact Customer
-- Run this manually in the Supabase SQL editor (not run automatically).
-- Every statement is written to be safe to re-run (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Helper: is this the signed-in seller's order?
--    (true if at least one order_item in the order belongs to one of
--    the seller's products). Recreated here in case it doesn't exist
--    yet in this project.
-- ------------------------------------------------------------
create or replace function public.is_seller_of_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.order_items oi
    join public.products p on p.id = oi.product_id
    where oi.order_id = target_order_id
      and p.seller_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- 2. Sellers can update order_status on orders that contain their
--    products (needed for "Confirm Shipment" and "Refund").
-- ------------------------------------------------------------
alter table public.orders enable row level security;

drop policy if exists "orders_seller_update" on public.orders;
create policy "orders_seller_update" on public.orders
  for update
  using (public.is_seller_of_order(id))
  with check (public.is_seller_of_order(id));

-- ------------------------------------------------------------
-- 3. seller_messages: order_id column (no-op if it already exists),
--    plus read/write policies for both sides of the conversation.
-- ------------------------------------------------------------
alter table public.seller_messages
  add column if not exists order_id uuid references public.orders(id) on delete set null;

create index if not exists idx_seller_messages_order on public.seller_messages(order_id);

alter table public.seller_messages enable row level security;

-- Seller can read every message on threads they own.
drop policy if exists "seller_messages_seller_select" on public.seller_messages;
create policy "seller_messages_seller_select" on public.seller_messages
  for select
  using (seller_id = auth.uid());

-- Seller can insert outbound messages on orders that are theirs.
drop policy if exists "seller_messages_seller_insert_outbound" on public.seller_messages;
create policy "seller_messages_seller_insert_outbound" on public.seller_messages
  for insert
  with check (
    seller_id = auth.uid()
    and direction = 'outbound'
    and (order_id is null or public.is_seller_of_order(order_id))
  );

-- Customer can read the seller's outbound messages addressed to them.
drop policy if exists "seller_messages_customer_select" on public.seller_messages;
create policy "seller_messages_customer_select" on public.seller_messages
  for select
  using (customer_email = (auth.jwt() ->> 'email'));

-- Customer can insert inbound messages addressed with their own email.
drop policy if exists "seller_messages_customer_insert_inbound" on public.seller_messages;
create policy "seller_messages_customer_insert_inbound" on public.seller_messages
  for insert
  with check (
    direction = 'inbound'
    and customer_email = (auth.jwt() ->> 'email')
  );

-- ------------------------------------------------------------
-- 4. Sellers need to see the buyer's name/email to address a message
--    and print a shipping label — grant read access to the profile of
--    any buyer who has an order containing one of the seller's products.
-- ------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_seller_read_buyers" on public.profiles;
create policy "profiles_seller_read_buyers" on public.profiles
  for select
  using (
    exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      join public.products p on p.id = oi.product_id
      where o.user_id = profiles.id
        and p.seller_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 5. seller_refunds: records of seller-issued refunds (separate from
--    the existing customer-return-request refund flow).
-- ------------------------------------------------------------
create table if not exists public.seller_refunds (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade not null,
  amount numeric(10,2) not null,
  refund_type text not null check (refund_type in ('full','partial')),
  reason text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_seller_refunds_seller on public.seller_refunds(seller_id);
create index if not exists idx_seller_refunds_order on public.seller_refunds(order_id);

alter table public.seller_refunds enable row level security;

drop policy if exists "seller_refunds_seller_insert" on public.seller_refunds;
create policy "seller_refunds_seller_insert" on public.seller_refunds
  for insert
  with check (seller_id = auth.uid() and public.is_seller_of_order(order_id));

drop policy if exists "seller_refunds_seller_select" on public.seller_refunds;
create policy "seller_refunds_seller_select" on public.seller_refunds
  for select
  using (seller_id = auth.uid());

-- Optional: let the buyer see refunds issued on their own orders.
drop policy if exists "seller_refunds_buyer_select" on public.seller_refunds;
create policy "seller_refunds_buyer_select" on public.seller_refunds
  for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = seller_refunds.order_id
        and o.user_id = auth.uid()
    )
  );
