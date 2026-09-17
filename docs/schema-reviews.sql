-- ============================================
-- Module 13: reviews table
-- ============================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  created_at timestamptz default now()
);

create index if not exists idx_reviews_product on public.reviews(product_id);

alter table public.reviews enable row level security;

-- Anyone can read reviews
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (true);

-- Signed-in users can post reviews (but not required for assignment)
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);

-- ============================================
-- Seed sample reviews
-- Assign 3 reviews to every product via a cross join
-- ============================================
do $$
declare
  p record;
  sample_names text[] := array['Alex M.', 'Priya S.', 'Jordan K.', 'Sam R.', 'Taylor W.', 'Morgan L.'];
  sample_titles text[] := array['Excellent quality', 'Great value', 'Highly recommend', 'Exactly as described', 'Works perfectly', 'Very satisfied'];
  sample_bodies text[] := array[
    'Exceeded my expectations. Fast shipping and great packaging.',
    'Very good product for the price. Would buy again.',
    'Exactly as described. No complaints so far.',
    'Works perfectly. Setup was easy and quality feels premium.',
    'Really happy with this purchase. Recommended.',
    'Solid product overall. Delivery was on time.'
  ];
  i int;
begin
  for p in select id from public.products loop
    for i in 1..3 loop
      insert into public.reviews (product_id, author_name, rating, title, body)
      values (
        p.id,
        sample_names[1 + floor(random()*array_length(sample_names,1))::int],
        4 + floor(random()*2)::int,  -- 4 or 5
        sample_titles[1 + floor(random()*array_length(sample_titles,1))::int],
        sample_bodies[1 + floor(random()*array_length(sample_bodies,1))::int]
      );
    end loop;
  end loop;
end $$;