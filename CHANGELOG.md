# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Database migration (tables, `place_order` and `update_order_status` functions, `dashboard_stats` and `customer_summary` views, RLS), seed/reset script, and database README.
- shadcn/ui primitives themed to the Mondays brand: paper, ink, and category colors; lilac primary; single-color gradients; a glass utility; pill buttons at least 44px tall.
- Calistoga and Schibsted Grotesk loaded with `next/font`.
- Server-only Supabase client that fails with a clear message when an environment variable is missing or `SUPABASE_URL` has a path.
- Money helpers (`formatPHP`, `lineTotal`, `sumCents`) in integer centavos, with tests including the PHP 325.50 example.
- Order status labels, badge styles, and allowed transitions; product status and category color helpers, with tests.
- Shared types for the database schema, catalog, orders, cart, and action results.
- Shop layout shell: promo strip, floating glass nav pill with a mobile menu, and the ink footer card with fictional contact details.
- Temporary home page listing active products live from Supabase.
- Root not-found and error pages.
- `.env.example`, README skeleton, test log, and AI usage log.

### Changed
- Moved the app into `src/`.
