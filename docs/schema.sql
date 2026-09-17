-- ============================================
-- Amazon Rebuild — Database Schema
-- ============================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================
-- 1. profiles
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz default now()
);

-- ============================================
-- 2. categories
-- ============================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  image_url text,
  description text
);

-- ============================================
-- 3. products
-- ============================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text unique,
  description text,
  price numeric(10,2) not null,
  old_price numeric(10,2),
  image_url text,
  rating numeric(2,1) default 0,
  review_count integer default 0,
  stock integer default 0,
  brand text,
  created_at timestamptz default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);

-- ============================================
-- 4. cart_items
-- ============================================
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

create index if not exists idx_cart_items_user on public.cart_items(user_id);

-- ============================================
-- 5. addresses
-- ============================================
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  phone text,
  address_line text not null,
  city text not null,
  postal_code text,
  country text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

-- ============================================
-- 6. orders
-- ============================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  address_id uuid references public.addresses(id) on delete set null,
  subtotal numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text default 'mock_card',
  payment_status text default 'paid',
  order_status text default 'order_placed',
  created_at timestamptz default now()
);

create index if not exists idx_orders_user on public.orders(user_id);

-- ============================================
-- 7. order_items
-- ============================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_title text not null,
  product_image text,
  price numeric(10,2) not null,
  quantity integer not null default 1
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ============================================
-- 8. Auto-create profile on user signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 9. Enable Row Level Security
-- ============================================
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.cart_items  enable row level security;
alter table public.addresses   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ============================================
-- 10. RLS Policies
-- ============================================

-- profiles: user can view/update only their own
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- categories: public read
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (true);

-- products: public read
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (true);

-- cart_items: user owns their cart
drop policy if exists "cart_select_own" on public.cart_items;
create policy "cart_select_own" on public.cart_items
  for select using (auth.uid() = user_id);

drop policy if exists "cart_insert_own" on public.cart_items;
create policy "cart_insert_own" on public.cart_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "cart_update_own" on public.cart_items;
create policy "cart_update_own" on public.cart_items
  for update using (auth.uid() = user_id);

drop policy if exists "cart_delete_own" on public.cart_items;
create policy "cart_delete_own" on public.cart_items
  for delete using (auth.uid() = user_id);

-- addresses: user owns their addresses
drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own" on public.addresses
  for select using (auth.uid() = user_id);

drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own" on public.addresses
  for insert with check (auth.uid() = user_id);

drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own" on public.addresses
  for update using (auth.uid() = user_id);

drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own" on public.addresses
  for delete using (auth.uid() = user_id);

-- orders: user owns their orders
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

-- order_items: user can view items for their own orders
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );