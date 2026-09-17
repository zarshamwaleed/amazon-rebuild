-- ============================================
-- Amazon Rebuild — Seed Data
-- ============================================

-- Clear existing data (safe during development)
delete from public.order_items;
delete from public.orders;
delete from public.cart_items;
delete from public.addresses;
delete from public.products;
delete from public.categories;

-- ============================================
-- Categories
-- ============================================
insert into public.categories (id, name, slug, image_url, description) values
  ('11111111-1111-1111-1111-111111111111', 'Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600', 'Latest gadgets and devices'),
  ('22222222-2222-2222-2222-222222222222', 'Books', 'books', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', 'Bestsellers and classics'),
  ('33333333-3333-3333-3333-333333333333', 'Home & Kitchen', 'home-kitchen', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', 'Everything for your home'),
  ('44444444-4444-4444-4444-444444444444', 'Fashion', 'fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600', 'Clothing and accessories'),
  ('55555555-5555-5555-5555-555555555555', 'Sports & Outdoors', 'sports-outdoors', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', 'Gear for every sport'),
  ('66666666-6666-6666-6666-666666666666', 'Toys & Games', 'toys-games', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600', 'Fun for all ages');

-- ============================================
-- Products
-- ============================================
insert into public.products (category_id, title, slug, description, price, old_price, image_url, rating, review_count, stock, brand) values
  -- Electronics
  ('11111111-1111-1111-1111-111111111111', 'Wireless Noise-Cancelling Headphones', 'wireless-headphones', 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.', 199.99, 249.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 4.5, 1240, 45, 'SoundPro'),
  ('11111111-1111-1111-1111-111111111111', '4K Ultra HD Smart TV 55"', 'smart-tv-55', 'Vibrant 4K display with HDR10+ and built-in streaming apps.', 549.99, 699.99, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', 4.3, 890, 22, 'ViewMax'),
  ('11111111-1111-1111-1111-111111111111', 'True Wireless Earbuds', 'wireless-earbuds', 'Compact earbuds with crystal clear sound and charging case.', 79.99, 99.99, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', 4.4, 2100, 120, 'SoundPro'),
  ('11111111-1111-1111-1111-111111111111', 'Smartwatch with Fitness Tracker', 'smartwatch-fitness', 'Track your health, workouts, and notifications on your wrist.', 149.99, 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 4.6, 3400, 78, 'PulseTech'),
  ('11111111-1111-1111-1111-111111111111', 'Portable Bluetooth Speaker', 'bluetooth-speaker', 'Waterproof speaker with deep bass and 12-hour playback.', 49.99, 69.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', 4.7, 5600, 200, 'SoundPro'),
  ('11111111-1111-1111-1111-111111111111', 'Laptop 15.6" 16GB RAM', 'laptop-15', 'Powerful laptop for work and play with SSD storage.', 899.99, 1099.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', 4.5, 450, 15, 'NoteBook Pro'),
  ('11111111-1111-1111-1111-111111111111', 'Mechanical Gaming Keyboard', 'gaming-keyboard', 'RGB backlit mechanical keyboard with tactile switches.', 89.99, 129.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', 4.6, 1800, 90, 'KeyForge'),

  -- Books
  ('22222222-2222-2222-2222-222222222222', 'The Midnight Library', 'midnight-library', 'A moving novel about regrets, hope, and second chances.', 14.99, 19.99, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600', 4.7, 12000, 300, 'Penguin'),
  ('22222222-2222-2222-2222-222222222222', 'Atomic Habits', 'atomic-habits', 'An easy proven way to build good habits and break bad ones.', 16.99, 22.99, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600', 4.8, 25000, 500, 'Penguin'),
  ('22222222-2222-2222-2222-222222222222', 'Project Hail Mary', 'project-hail-mary', 'A lone astronaut must save Earth in this gripping sci-fi.', 18.99, 24.99, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600', 4.8, 8900, 150, 'Ballantine'),
  ('22222222-2222-2222-2222-222222222222', 'The Psychology of Money', 'psychology-of-money', 'Timeless lessons on wealth, greed, and happiness.', 15.99, 21.99, 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600', 4.6, 9800, 220, 'Harriman'),

  -- Home & Kitchen
  ('33333333-3333-3333-3333-333333333333', 'Stainless Steel Coffee Maker', 'coffee-maker', 'Programmable 12-cup coffee maker with thermal carafe.', 89.99, 119.99, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600', 4.4, 3400, 65, 'BrewMaster'),
  ('33333333-3333-3333-3333-333333333333', 'Non-Stick Cookware Set 10-Piece', 'cookware-set', 'Durable non-stick pots and pans for every kitchen.', 149.99, 199.99, 'https://images.unsplash.com/photo-1584990347449-a8f5c8f1a3e4?w=600', 4.5, 2100, 40, 'ChefLine'),
  ('33333333-3333-3333-3333-333333333333', 'Memory Foam Pillow', 'memory-foam-pillow', 'Ergonomic pillow for better sleep and neck support.', 39.99, 54.99, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600', 4.3, 5600, 180, 'SleepWell'),
  ('33333333-3333-3333-3333-333333333333', 'Robot Vacuum Cleaner', 'robot-vacuum', 'Smart mapping robot vacuum with app control.', 299.99, 399.99, 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600', 4.5, 1200, 30, 'CleanBot'),

  -- Fashion
  ('44444444-4444-4444-4444-444444444444', 'Classic Denim Jacket', 'denim-jacket', 'Timeless denim jacket with a comfortable fit.', 69.99, 89.99, 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600', 4.4, 890, 100, 'UrbanWear'),
  ('44444444-4444-4444-4444-444444444444', 'Running Shoes', 'running-shoes', 'Lightweight running shoes with responsive cushioning.', 109.99, 139.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 4.6, 3400, 150, 'StridePro'),
  ('44444444-4444-4444-4444-444444444444', 'Leather Wallet', 'leather-wallet', 'Slim leather wallet with RFID protection.', 34.99, 49.99, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 4.5, 2200, 200, 'Craft&Co'),

  -- Sports & Outdoors
  ('55555555-5555-5555-5555-555555555555', 'Yoga Mat Non-Slip', 'yoga-mat', 'Extra thick yoga mat for comfort and stability.', 29.99, 39.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', 4.5, 1800, 220, 'ZenFit'),
  ('55555555-5555-5555-5555-555555555555', 'Adjustable Dumbbell Set', 'dumbbell-set', 'Space-saving adjustable dumbbells for home workouts.', 199.99, 279.99, 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600', 4.6, 900, 25, 'IronCore'),
  ('55555555-5555-5555-5555-555555555555', 'Camping Tent 4-Person', 'camping-tent', 'Waterproof 4-person tent for your outdoor adventures.', 129.99, 179.99, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600', 4.4, 1400, 55, 'TrailMaster'),

  -- Toys & Games
  ('66666666-6666-6666-6666-666666666666', 'Building Blocks Set 1000 Pieces', 'building-blocks', 'Creative building blocks set for hours of fun.', 49.99, 69.99, 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600', 4.7, 3200, 300, 'BrickWorld'),
  ('66666666-6666-6666-6666-666666666666', 'Strategy Board Game', 'strategy-board-game', 'Award-winning strategy board game for 2-6 players.', 39.99, 54.99, 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=600', 4.6, 2100, 90, 'GameNight'),
  ('66666666-6666-6666-6666-666666666666', 'Remote Control Car', 'rc-car', 'High-speed RC car with rechargeable battery.', 59.99, 79.99, 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600', 4.3, 1500, 130, 'SpeedRacer');