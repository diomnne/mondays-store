# Mondays: database

Postgres on Supabase. One migration (`migrations/20261106000000_init.sql`) and one seed/reset file (`seed.sql`).

## Setup

**Supabase CLI (local):** `supabase start`, then `supabase db reset`. That runs the migration and then `seed.sql`.

**Hosted project:** open the SQL editor, run the migration file once, then run `seed.sql`. Run `seed.sql` again any time to reset the demo data.

Environment variables (server only, never prefixed `NEXT_PUBLIC_`):

```
SUPABASE_URL=https://your-project.supabase.co   # project URL only, no /rest/v1
SUPABASE_SECRET_KEY=sb_secret_...                # secret key (acts as service_role)
```

## Data model

```
categories 1 ──< products 1 ──< order_items >── 1 orders
```

- **categories**: name is required, unique ignoring case and surrounding spaces. Can't be deleted while a product uses it (`ON DELETE RESTRICT`).
- **products**: price in centavos (> 0), stock (whole number ≥ 0), `is_active`, `is_featured`. Out of stock is derived: active with stock 0. Can't be hard-deleted once it's in an order (`ON DELETE RESTRICT`), so the app offers "mark inactive" instead.
- **orders**: guest checkout fields, email stored lowercase and trimmed, status enum, total in centavos, order number `MON-0001`, `MON-0002`, and so on.
- **order_items**: snapshot of product name and unit price at checkout, quantity, and a generated line total. Editing a product never changes an existing order.

There's no customers table. `customer_summary` derives one row per normalized email, with the latest name and contact. `dashboard_stats` returns the six overview figures.

## Functions

**`place_order(name, email, contact, address, payment_method, notes, items jsonb)`**: the only way an order is created. In one transaction it validates the fields, merges duplicate lines, locks the products, and checks each one is active, in stock, and still at the price the customer saw. Then it saves the order and its items and reduces stock. If anything fails, nothing is written.

- `items`: `[{"product_id": "...", "quantity": 2, "expected_unit_price_cents": 34900}]`
- Success: `{"ok": true, "order_id", "order_number", "total_cents"}`
- Failure codes: `invalid_fields` (with per-field `errors`), `empty_cart`, `invalid_items`, `cart_changed` (with `changes`: `unavailable`, `insufficient_stock`, or `price_changed` per product)

**`update_order_status(order_id, new_status)`**: allows one step forward through pending → confirmed → preparing → shipped → completed, or cancellation from pending or confirmed. Cancelling restores stock exactly once (`stock_restored_at`). Completed and cancelled are final. Returns `{"ok": true, "status"}` or `{"ok": false, "code": "invalid_transition" | "not_found" | "invalid_status"}`.

## Access

RLS is enabled on every table with no policies, and the functions and views are granted only to `service_role`. All reads and writes go through Next.js server code using the secret key (`SUPABASE_SECRET_KEY`, which has the service role), so the public anon key can't read or write anything.

## Seed data

- 3 categories and 12 products.
- Tuesday Powder is inactive. Saturday Stain is active with zero stock.
- 8 historical orders that match the admin design: 2 pending, 2 completed, 1 cancelled, 6 unique customers, PHP 1,206.00 in completed sales.
- New orders continue from MON-0009.
