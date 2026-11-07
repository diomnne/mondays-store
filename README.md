# Mondays

A responsive e-commerce site for **Mondays**, a fictional cosmetics brand: a customer storefront and an admin dashboard sharing one Supabase database. Built as a web development internship take-home assessment.

> Mondays is fictional. Contact details, customers, and orders are sample data, and no payment is collected.

## Contents
- [Overview](#overview)
- [Technologies](#technologies)
- [Storage approach and limitations](#storage-approach-and-limitations)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup, seed, and reset](#database-setup-seed-and-reset)
- [Routes](#routes)
- [Demo credentials](#demo-credentials)
- [System flow and data model](#system-flow-and-data-model)
- [Testing](#testing)
- [Screenshots and demo video](#screenshots-and-demo-video)
- [Live links](#live-links)
- [Known issues](#known-issues)
- [Unfinished requirements](#unfinished-requirements)
- [AI, templates, and tutorials disclosure](#ai-templates-and-tutorials-disclosure)

## Overview
_TODO (Phase 6): what the store does, the customer journey from browsing to confirmation, and how admin manages it._

## Technologies
- Next.js 16 (App Router, Cache Components) with TypeScript in strict mode
- Tailwind CSS v4 and shadcn/ui (Radix primitives)
- Supabase Postgres via `@supabase/supabase-js`, server-side only
- zod (validation), jose (admin session cookie), vitest (unit tests)
- Hosting: Vercel _(TODO: confirm when deployed)_

## Storage approach and limitations
_TODO: shared Postgres database; all reads and writes go through the server with the secret key; orders and stock changes happen in one database transaction (`place_order`); the cart lives in localStorage as product ids and quantities only. Limitations to list._

## Getting started
Requirements: Node.js 20.9 or newer (developed on Node 24) and npm.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (vitest) |

## Environment variables
All variables are server-only. See [`.env.example`](.env.example).

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Project URL only, e.g. `https://your-project-ref.supabase.co` (no `/rest/v1`) |
| `SUPABASE_SECRET_KEY` | Supabase secret key; never exposed to the browser |
| `ADMIN_EMAIL` | Demo admin email |
| `ADMIN_PASSWORD` | Demo admin password |
| `ADMIN_SESSION_SECRET` | 32+ random characters used to sign the admin session cookie |

## Database setup, seed, and reset
Full details, including the data model and the two database functions, are in [`supabase/README.md`](supabase/README.md).

1. In the Supabase dashboard, open the SQL editor and run [`supabase/migrations/20261106000000_init.sql`](supabase/migrations/20261106000000_init.sql) once.
2. Run [`supabase/seed.sql`](supabase/seed.sql) to load 3 categories, 12 products, and 8 sample orders.
3. **Reset:** run `seed.sql` again at any time. It clears all data and reloads the demo store.

With the Supabase CLI: `supabase start`, then `supabase db reset` (runs the migration and the seed).

## Routes
**Customer**

| Route | Page |
|---|---|
| `/` | Home |
| `/products` | Product listing (search, category filter, price sort) |
| `/products/[slug]` | Product details (404 for missing or inactive products) |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/orders/[id]` | Order confirmation by order uuid (404 if unknown) |

**Admin** _(Phases 4–5)_

| Route | Page |
|---|---|
| `/admin/login` | Demo login |
| `/admin` | Overview |
| `/admin/products` | Products |
| `/admin/categories` | Categories |
| `/admin/orders` | Orders and order details |
| `/admin/customers` | Customer summary |

## Demo credentials
Simulated login for demonstration only. **Not production-safe.**

- Email: `admin@mondays.example`
- Password: `mondays-demo`

## System flow and data model
_TODO: order flow from cart to `place_order` to admin status updates; tables `categories`, `products`, `orders`, `order_items`; views `dashboard_stats`, `customer_summary`; relationships._

## Testing
- Automated: `npm test` runs unit tests for money math (including the PHP 325.50 example), order status transitions, and product status.
- Manual: see the [test log](docs/test-log.md) for acceptance checks 01–10.

## Screenshots and demo video
_TODO: desktop and mobile screenshots in [`docs/screenshots/`](docs/screenshots/), and a link to the 3–5 minute demo video._

## Live links
_TODO: customer and admin URLs once deployed._

## Known issues
_TODO._

## Unfinished requirements
_TODO._

## AI, templates, and tutorials disclosure
_TODO: summarize [`docs/ai-usage.md`](docs/ai-usage.md). Product images are AI-generated._

Project scaffolded with `create-next-app`; UI primitives from shadcn/ui.
