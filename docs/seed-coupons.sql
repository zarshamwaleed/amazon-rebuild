-- ============================================
-- Seed coupons (idempotent — skips if products not found)
-- ============================================

-- Clear existing seeded coupons to make re-running safe
delete from public.user_coupons;
delete from public.coupon_products;
delete from public.coupons;

-- Helper: create a coupon and link it to a product by title
do $$
declare
  cid uuid;
  pid uuid;
  coupon_defs record;
begin
  for coupon_defs in
    select * from (values
      ('20% Off Wireless Headphones', '20% off SoundPro wireless headphones', 'percentage', 20, 0, 30, 'Wireless Noise-Cancelling Headphones'),
      ('15% Off Smart TVs', 'Save 15% on ViewMax 4K Smart TVs', 'percentage', 15, 0, 45, '4K Ultra HD Smart TV 55"'),
      ('$10 Off True Wireless Earbuds', 'Save $10 on SoundPro earbuds', 'fixed', 10, 25, 20, 'True Wireless Earbuds'),
      ('25% Off Smartwatch', 'Limited-time smartwatch deal', 'percentage', 25, 0, 15, 'Smartwatch with Fitness Tracker'),
      ('20% Off Bluetooth Speaker', 'Save 20% on SoundPro speakers', 'percentage', 20, 0, 30, 'Portable Bluetooth Speaker'),
      ('15% Off Laptops', 'Save 15% on NoteBook Pro laptops', 'percentage', 15, 0, 60, 'Laptop 15.6" 16GB RAM'),
      ('30% Off Gaming Keyboards', 'Limited keyboard deal', 'percentage', 30, 0, 10, 'Mechanical Gaming Keyboard'),
      ('$5 Off Atomic Habits', 'Save $5 on Atomic Habits', 'fixed', 5, 10, 90, 'Atomic Habits'),
      ('20% Off Coffee Maker', 'Save on BrewMaster', 'percentage', 20, 0, 45, 'Stainless Steel Coffee Maker'),
      ('15% Off Cookware Set', 'Save on ChefLine cookware', 'percentage', 15, 0, 60, 'Non-Stick Cookware Set 10-Piece'),
      ('25% Off Robot Vacuum', 'Limited vacuum deal', 'percentage', 25, 0, 20, 'Robot Vacuum Cleaner'),
      ('20% Off Running Shoes', 'Save on StridePro', 'percentage', 20, 0, 45, 'Running Shoes')
    ) as t(title, description, dtype, dvalue, dmin, ddays, product_title)
  loop
    insert into public.coupons (title, description, discount_type, discount_value, minimum_purchase, end_date, status)
    values (
      coupon_defs.title,
      coupon_defs.description,
      coupon_defs.dtype,
      coupon_defs.dvalue,
      coupon_defs.dmin,
      now() + (coupon_defs.ddays || ' days')::interval,
      'active'
    )
    returning id into cid;

    select id into pid from public.products where title = coupon_defs.product_title limit 1;

    if pid is not null then
      insert into public.coupon_products (coupon_id, product_id) values (cid, pid);
    end if;
  end loop;
end $$;