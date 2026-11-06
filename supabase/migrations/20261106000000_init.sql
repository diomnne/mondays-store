-- Mondays: initial schema
-- Customer site and admin dashboard share these tables.
-- All money is stored as integer centavos (PHP 349.00 = 34900) to avoid rounding errors.

-- ─────────────────────────────────────────────────────────────
-- Types
-- ─────────────────────────────────────────────────────────────
create type public.order_status as enum
  ('pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled');

create type public.payment_method as enum
  ('cash_on_delivery', 'e_wallet', 'bank_transfer');

-- ─────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (btrim(name) <> ''),
  created_at  timestamptz not null default now()
);

-- "Lips" and " lips " count as the same name.
create unique index categories_name_unique on public.categories (lower(btrim(name)));

-- ─────────────────────────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────────────────────────
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  -- RESTRICT: a category can't be deleted while products use it.
  category_id  uuid not null references public.categories (id) on delete restrict,
  name         text not null check (btrim(name) <> ''),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description  text not null default '',
  image_url    text not null,
  price_cents  integer not null check (price_cents > 0),
  stock        integer not null check (stock >= 0),
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Orders
-- ─────────────────────────────────────────────────────────────
create sequence public.order_number_seq;

create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique
                     default ('MON-' || lpad(nextval('public.order_number_seq')::text, 4, '0')),
  customer_name      text not null check (btrim(customer_name) <> ''),
  -- Stored normalized so the customer list can group by it.
  customer_email     text not null check (
                       customer_email = lower(btrim(customer_email))
                       and customer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
                     ),
  contact_number     text not null check (btrim(contact_number) <> ''),
  delivery_address   text not null check (btrim(delivery_address) <> ''),
  payment_method     public.payment_method not null,
  notes              text,
  status             public.order_status not null default 'pending',
  total_cents        integer not null check (total_cents > 0),
  -- Set once when a cancellation puts stock back. Guards against double restores.
  stock_restored_at  timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index orders_created_at_idx on public.orders (created_at desc);
create index orders_email_idx on public.orders (customer_email);
create index orders_status_idx on public.orders (status);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Order items (snapshots)
-- ─────────────────────────────────────────────────────────────
create table public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders (id) on delete cascade,
  -- RESTRICT: a product that appears in any order can't be hard-deleted.
  product_id        uuid not null references public.products (id) on delete restrict,
  -- Snapshot at checkout. Editing the product later never changes these.
  product_name      text not null,
  unit_price_cents  integer not null check (unit_price_cents > 0),
  quantity          integer not null check (quantity > 0),
  line_total_cents  integer generated always as (unit_price_cents * quantity) stored
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- ─────────────────────────────────────────────────────────────
-- place_order: the only way an order gets created.
-- Runs in one transaction: rechecks every product against the database,
-- and either saves the order + items + stock changes together, or saves nothing.
--
-- p_items: [{"product_id": uuid, "quantity": int, "expected_unit_price_cents": int}, ...]
-- Returns {"ok": true, "order_id", "order_number", "total_cents"}
--      or {"ok": false, "code": "...", ...} with nothing written.
-- ─────────────────────────────────────────────────────────────
create or replace function public.place_order(
  p_customer_name     text,
  p_customer_email    text,
  p_contact_number    text,
  p_delivery_address  text,
  p_payment_method    text,
  p_notes             text,
  p_items             jsonb
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_name      text := btrim(coalesce(p_customer_name, ''));
  v_email     text := lower(btrim(coalesce(p_customer_email, '')));
  v_contact   text := btrim(coalesce(p_contact_number, ''));
  v_address   text := btrim(coalesce(p_delivery_address, ''));
  v_notes     text := nullif(btrim(coalesce(p_notes, '')), '');
  v_errors    jsonb := '{}'::jsonb;
  v_changes   jsonb := '[]'::jsonb;
  v_total     integer := 0;
  v_order     public.orders%rowtype;
  r           record;
begin
  -- 1. Validate customer fields (the client validates too, but this is the one that counts).
  if v_name = '' then
    v_errors := v_errors || '{"customer_name": "Enter your name."}';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    v_errors := v_errors || '{"customer_email": "Enter a valid email address."}';
  end if;
  if v_contact = '' then
    v_errors := v_errors || '{"contact_number": "Enter a contact number."}';
  end if;
  if v_address = '' then
    v_errors := v_errors || '{"delivery_address": "Enter a delivery address."}';
  end if;
  if p_payment_method is null
     or p_payment_method not in ('cash_on_delivery', 'e_wallet', 'bank_transfer') then
    v_errors := v_errors || '{"payment_method": "Choose a payment method."}';
  end if;

  if v_errors <> '{}'::jsonb then
    return jsonb_build_object('ok', false, 'code', 'invalid_fields', 'errors', v_errors);
  end if;

  -- 2. Validate the item list shape.
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'code', 'empty_cart');
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as e
    where jsonb_typeof(e -> 'quantity') <> 'number'
       or (e ->> 'quantity')::numeric <> trunc((e ->> 'quantity')::numeric)
       or (e ->> 'quantity')::numeric < 1
       or (e ->> 'product_id') is null
       or (e ->> 'product_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ) then
    return jsonb_build_object('ok', false, 'code', 'invalid_items');
  end if;

  -- 3. Merge duplicate lines, lock the products (in id order, to avoid deadlocks),
  --    and compare each against what the customer saw.
  if to_regclass('pg_temp._cart') is not null then
    drop table _cart;
  end if;
  create temp table _cart on commit drop as
    select (e ->> 'product_id')::uuid                       as product_id,
           sum((e ->> 'quantity')::int)::int               as quantity,
           max((e ->> 'expected_unit_price_cents')::int)   as expected_price
    from jsonb_array_elements(p_items) as e
    group by 1;

  perform 1
  from public.products p
  where p.id in (select product_id from _cart)
  order by p.id
  for update;

  for r in
    select c.product_id, c.quantity, c.expected_price,
           p.id as found_id, p.name, p.price_cents, p.stock, p.is_active
    from _cart c
    left join public.products p on p.id = c.product_id
    order by c.product_id
  loop
    if r.found_id is null or not r.is_active then
      v_changes := v_changes || jsonb_build_object(
        'product_id', r.product_id, 'name', r.name, 'reason', 'unavailable');
    elsif r.stock < r.quantity then
      v_changes := v_changes || jsonb_build_object(
        'product_id', r.product_id, 'name', r.name, 'reason', 'insufficient_stock',
        'available_stock', r.stock, 'requested', r.quantity);
    elsif r.expected_price is distinct from r.price_cents then
      v_changes := v_changes || jsonb_build_object(
        'product_id', r.product_id, 'name', r.name, 'reason', 'price_changed',
        'old_price_cents', r.expected_price, 'new_price_cents', r.price_cents);
    end if;
  end loop;

  if jsonb_array_length(v_changes) > 0 then
    return jsonb_build_object('ok', false, 'code', 'cart_changed', 'changes', v_changes);
  end if;

  -- 4. Total from stored prices only.
  select sum(p.price_cents * c.quantity)::int
    into v_total
  from _cart c
  join public.products p on p.id = c.product_id;

  -- 5. Save order, items, and stock together.
  insert into public.orders
    (customer_name, customer_email, contact_number, delivery_address,
     payment_method, notes, total_cents)
  values
    (v_name, v_email, v_contact, v_address,
     p_payment_method::public.payment_method, v_notes, v_total)
  returning * into v_order;

  insert into public.order_items (order_id, product_id, product_name, unit_price_cents, quantity)
  select v_order.id, p.id, p.name, p.price_cents, c.quantity
  from _cart c
  join public.products p on p.id = c.product_id;

  update public.products p
     set stock = p.stock - c.quantity
    from _cart c
   where p.id = c.product_id;

  return jsonb_build_object(
    'ok', true,
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'total_cents', v_order.total_cents
  );
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- update_order_status: enforces the status rules.
--   pending → confirmed → preparing → shipped → completed (one step forward only)
--   cancelled: only from pending or confirmed; restores stock exactly once.
--   completed and cancelled are final.
-- ─────────────────────────────────────────────────────────────
create or replace function public.update_order_status(
  p_order_id    uuid,
  p_new_status  text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_order   public.orders%rowtype;
  v_new     public.order_status;
  v_next    public.order_status;
begin
  if p_new_status is null
     or p_new_status not in ('pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled') then
    return jsonb_build_object('ok', false, 'code', 'invalid_status');
  end if;
  v_new := p_new_status::public.order_status;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;

  v_next := case v_order.status
              when 'pending'   then 'confirmed'
              when 'confirmed' then 'preparing'
              when 'preparing' then 'shipped'
              when 'shipped'   then 'completed'
              else null
            end;

  if v_new = 'cancelled' then
    if v_order.status not in ('pending', 'confirmed') then
      return jsonb_build_object('ok', false, 'code', 'invalid_transition',
        'from', v_order.status, 'to', v_new);
    end if;

    if v_order.stock_restored_at is null then
      update public.products p
         set stock = p.stock + i.quantity
        from (select product_id, sum(quantity)::int as quantity
                from public.order_items
               where order_id = v_order.id
               group by product_id) i
       where p.id = i.product_id;
    end if;

    update public.orders
       set status = 'cancelled',
           stock_restored_at = coalesce(stock_restored_at, now())
     where id = v_order.id;

  elsif v_next is not null and v_new = v_next then
    update public.orders set status = v_new where id = v_order.id;

  else
    return jsonb_build_object('ok', false, 'code', 'invalid_transition',
      'from', v_order.status, 'to', v_new);
  end if;

  return jsonb_build_object('ok', true, 'order_id', v_order.id, 'status', v_new);
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Read models for the admin dashboard
-- ─────────────────────────────────────────────────────────────

-- One row per unique (normalized) email. Name and contact come from the latest order.
create view public.customer_summary
with (security_invoker = true) as
with latest as (
  select distinct on (customer_email)
         customer_email, customer_name, contact_number
  from public.orders
  order by customer_email, created_at desc
),
totals as (
  select customer_email,
         count(*)::int as order_count,
         coalesce(sum(total_cents) filter (where status = 'completed'), 0)::int
           as completed_total_cents
  from public.orders
  group by customer_email
)
select l.customer_email as email,
       l.customer_name  as name,
       l.contact_number,
       t.order_count,
       t.completed_total_cents
from latest l
join totals t using (customer_email);

create view public.dashboard_stats
with (security_invoker = true) as
select
  (select count(*) from public.products)::int                                   as total_products,
  (select count(*) from public.orders)::int                                     as total_orders,
  (select count(*) from public.orders where status = 'pending')::int            as pending_orders,
  (select count(*) from public.orders where status = 'completed')::int          as completed_orders,
  (select count(distinct customer_email) from public.orders)::int               as total_customers,
  (select coalesce(sum(total_cents), 0) from public.orders
    where status = 'completed')::int                                             as total_sales_cents;

-- ─────────────────────────────────────────────────────────────
-- Access control
-- Every read and write goes through Next.js server code using the service role key,
-- which bypasses RLS. RLS is on with no policies, so the public anon key can't touch
-- anything even if it leaks.
-- ─────────────────────────────────────────────────────────────
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

revoke all on function public.place_order(text, text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.update_order_status(uuid, text) from public, anon, authenticated;
grant execute on function public.place_order(text, text, text, text, text, text, jsonb) to service_role;
grant execute on function public.update_order_status(uuid, text) to service_role;

revoke all on public.customer_summary, public.dashboard_stats from anon, authenticated;
grant select on public.customer_summary, public.dashboard_stats to service_role;
