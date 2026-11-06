-- Mondays: seed / reset data
-- Safe to re-run: wipes everything and reloads the demo store.
-- All people, emails, phone numbers, and addresses are fictional.

truncate public.order_items, public.orders, public.products, public.categories restart identity cascade;
alter sequence public.order_number_seq restart with 1;

-- ─────────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────────
insert into public.categories (id, name) values
  ('11111111-1111-4111-8111-111111111111', 'Lips'),
  ('22222222-2222-4222-8222-222222222222', 'Face'),
  ('33333333-3333-4333-8333-333333333333', 'Skin');

-- ─────────────────────────────────────────────────────────────
-- Products (prices in centavos)
-- Tuesday Powder is inactive. Saturday Stain is active with zero stock.
-- ─────────────────────────────────────────────────────────────
insert into public.products
  (id, category_id, name, slug, description, image_url, price_cents, stock, is_active, is_featured)
values
  ('a0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111',
   'Monday Tint', 'monday-tint',
   'A sheer, buildable lip tint that looks like your lips, just more awake. Soft finish, never sticky.',
   '/products/monday-tint.jpg', 34900, 24, true, true),
  ('a0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111',
   'Friday Gloss', 'friday-gloss',
   'High-shine gloss with a light, cushiony feel. For when the week deserves a little sparkle.',
   '/products/friday-gloss.jpg', 29900, 18, true, true),
  ('a0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111',
   'Thursday Liner', 'thursday-liner',
   'A soft lip liner that glides on and stays put without drying your lips out.',
   '/products/thursday-liner.jpg', 25900, 30, true, false),
  ('a0000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111',
   'Sunday Balm', 'sunday-balm',
   'An overnight lip balm that does the work while you sleep in.',
   '/products/sunday-balm.jpg', 21900, 40, true, false),
  ('a0000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111',
   'Saturday Stain', 'saturday-stain',
   'A long-wear lip stain that survives brunch, coffee, and everything after.',
   '/products/saturday-stain.jpg', 32900, 0, true, false),
  ('a0000000-0000-4000-8000-000000000006', '22222222-2222-4222-8222-222222222222',
   'Tuesday Cheek', 'tuesday-cheek',
   'A cream blush you tap on with your fingers. Sheer at first, buildable if you want more.',
   '/products/tuesday-cheek.jpg', 42900, 12, true, true),
  ('a0000000-0000-4000-8000-000000000007', '22222222-2222-4222-8222-222222222222',
   'Wednesday Brow', 'wednesday-brow',
   'A tinted brow gel that tidies and fills in one swipe.',
   '/products/wednesday-brow.jpg', 28900, 20, true, false),
  ('a0000000-0000-4000-8000-000000000008', '22222222-2222-4222-8222-222222222222',
   'Monday Concealer', 'monday-concealer',
   'Light, creamy coverage for the mornings that show. Blends with a fingertip.',
   '/products/monday-concealer.jpg', 39900, 15, true, false),
  ('a0000000-0000-4000-8000-000000000009', '22222222-2222-4222-8222-222222222222',
   'Tuesday Powder', 'tuesday-powder',
   'A finely milled setting powder. Currently off the shelf.',
   '/products/tuesday-powder.jpg', 37900, 11, false, false),
  ('a0000000-0000-4000-8000-000000000010', '33333333-3333-4333-8333-333333333333',
   'Wednesday Wash', 'wednesday-wash',
   'A gentle gel cleanser that clears the day off without stripping your skin.',
   '/products/wednesday-wash.jpg', 37900, 22, true, true),
  ('a0000000-0000-4000-8000-000000000011', '33333333-3333-4333-8333-333333333333',
   'Thursday Mist', 'thursday-mist',
   'A hydrating face mist for the midweek slump. Spray, breathe, carry on.',
   '/products/thursday-mist.jpg', 34900, 17, true, false),
  ('a0000000-0000-4000-8000-000000000012', '33333333-3333-4333-8333-333333333333',
   'Sunday Cream', 'sunday-cream',
   'A rich night cream for skin that had a long week.',
   '/products/sunday-cream.jpg', 45900, 9, true, false);

-- ─────────────────────────────────────────────────────────────
-- Sample orders (historical: inserted directly, so they don't change current stock)
-- Figures match the admin design: 8 orders, 2 pending, 2 completed,
-- 6 unique customers, PHP 1,206.00 in completed sales.
-- ─────────────────────────────────────────────────────────────
insert into public.orders
  (id, order_number, customer_name, customer_email, contact_number, delivery_address,
   payment_method, notes, status, total_cents, stock_restored_at, created_at)
values
  ('b0000000-0000-4000-8000-000000000001', 'MON-0001', 'Bea Santos', 'bea.santos@example.com',
   '+63 918 000 2345', '45 Placeholder Avenue, Sample City', 'e_wallet', null,
   'cancelled', 34900, '2026-11-03 10:05:00+08', '2026-11-03 09:40:00+08'),
  ('b0000000-0000-4000-8000-000000000002', 'MON-0002', 'Fran Lim', 'fran.lim@example.com',
   '+63 922 000 6789', '9 Example Road, Demo Town', 'cash_on_delivery', null,
   'completed', 50800, null, '2026-11-03 16:05:00+08'),
  ('b0000000-0000-4000-8000-000000000003', 'MON-0003', 'Eli Navarro', 'eli.navarro@example.com',
   '+63 921 000 5678', '310 Mock Street, Sample City', 'bank_transfer', null,
   'completed', 69800, null, '2026-11-04 11:30:00+08'),
  ('b0000000-0000-4000-8000-000000000004', 'MON-0004', 'Dani Cruz', 'dani.cruz@example.com',
   '+63 920 000 4567', '7 Test Lane, Demo Town', 'cash_on_delivery', 'Call when nearby.',
   'shipped', 63800, null, '2026-11-04 20:47:00+08'),
  ('b0000000-0000-4000-8000-000000000005', 'MON-0005', 'Ana Reyes', 'ana.reyes@example.com',
   '+63 917 000 1111', '123 Sample Street, Sample City', 'e_wallet', null,
   'preparing', 45900, null, '2026-11-05 13:02:00+08'),
  ('b0000000-0000-4000-8000-000000000006', 'MON-0006', 'Carlo Diaz', 'carlo.diaz@example.com',
   '+63 919 000 3456', '88 Fictional Drive, Sample City', 'bank_transfer', null,
   'confirmed', 72800, null, '2026-11-05 18:20:00+08'),
  ('b0000000-0000-4000-8000-000000000007', 'MON-0007', 'Bea Santos', 'bea.santos@example.com',
   '+63 918 000 2345', '45 Placeholder Avenue, Sample City', 'e_wallet', null,
   'pending', 29900, null, '2026-11-06 09:15:00+08'),
  -- Ana's latest order uses a new number, so the customer list shows +63 917 000 1234.
  ('b0000000-0000-4000-8000-000000000008', 'MON-0008', 'Ana Reyes', 'ana.reyes@example.com',
   '+63 917 000 1234', '123 Sample Street, Sample City', 'cash_on_delivery',
   'Please leave it with the guard if I’m out.',
   'pending', 107700, null, '2026-11-06 10:42:00+08');

insert into public.order_items (order_id, product_id, product_name, unit_price_cents, quantity) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Monday Tint',    34900, 1),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004', 'Sunday Balm',    21900, 1),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000007', 'Wednesday Brow', 28900, 1),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Monday Tint',    34900, 2),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', 'Thursday Liner', 25900, 1),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000010', 'Wednesday Wash', 37900, 1),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000012', 'Sunday Cream',   45900, 1),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000006', 'Tuesday Cheek',  42900, 1),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'Friday Gloss',   29900, 1),
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000002', 'Friday Gloss',   29900, 1),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'Monday Tint',    34900, 2),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000010', 'Wednesday Wash', 37900, 1);

-- New orders continue from MON-0009.
select setval('public.order_number_seq', 8, true);
