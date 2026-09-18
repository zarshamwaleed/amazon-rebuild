-- ============================================
-- Coupons System (Tier B)
-- ============================================

-- 1. coupons
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric(10,2) not null,
  minimum_purchase numeric(10,2) default 0,
  start_date timestamptz default now(),
  end_date timestamptz not null,
  max_redemptions integer default 1000,
  status text default 'active',
  created_at timestamptz default now()
);

-- 2. coupon_products (many-to-many)
create table if not exists public.coupon_products (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references public.coupons(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  unique (coupon_id, product_id)
);

create index if not exists idx_coupon_products_coupon on public.coupon_products(coupon_id);
create index if not exists idx_coupon_products_product on public.coupon_products(product_id);

-- 3. user_coupons
create table if not exists public.user_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  coupon_id uuid references public.coupons(id) on delete cascade not null,
  clipped_at timestamptz default now(),
  used_at timestamptz,
  status text default 'clipped' check (status in ('clipped','used','expired')),
  unique (user_id, coupon_id)
);

create index if not exists idx_user_coupons_user on public.user_coupons(user_id);

-- ============================================
-- RLS
-- ============================================
alter table public.coupons enable row level security;
alter table public.coupon_products enable row level security;
alter table public.user_coupons enable row level security;

-- coupons: public read (only active ones handled in queries)
drop policy if exists "coupons_public_read" on public.coupons;
create policy "coupons_public_read" on public.coupons
  for select using (true);

-- coupon_products: public read
drop policy if exists "coupon_products_public_read" on public.coupon_products;
create policy "coupon_products_public_read" on public.coupon_products
  for select using (true);

-- user_coupons: user owns their clips
drop policy if exists "user_coupons_select_own" on public.user_coupons;
create policy "user_coupons_select_own" on public.user_coupons
  for select using (auth.uid() = user_id);

drop policy if exists "user_coupons_insert_own" on public.user_coupons;
create policy "user_coupons_insert_own" on public.user_coupons
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_coupons_delete_own" on public.user_coupons;
create policy "user_coupons_delete_own" on public.user_coupons
  for delete using (auth.uid() = user_id);

drop policy if exists "user_coupons_update_own" on public.user_coupons;
create policy "user_coupons_update_own" on public.user_coupons
  for update using (auth.uid() = user_id);