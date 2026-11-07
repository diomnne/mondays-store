# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Cart saved in localStorage as product ids and quantities only, with a pure, unit-tested cart module: adding merges duplicates, quantities stay whole numbers capped at stock, and malformed stored data is ignored.
- Hydration-safe cart provider that syncs across tabs, and a lilac item-count badge on the nav cart.
- Working Add to cart on the home, listing, and details pages, with a toast and a View cart action. Adding past the stock caps the quantity and says so.
- Server Action that checks the cart against the database (current name, price, stock, active status). Unavailable lines are removed and over-stock lines lowered, with a notice for each.
- Cart page with quantity steppers, Remove, line totals, subtotal, total, and an empty state.
- Checkout with inline validation from a shared zod schema (checked again on the server), a summary priced fresh from the server, and the `place_order` RPC sent the prices the customer saw. The button reads "Placing your order…" and can't be pressed twice.
- Checkout handling for every `place_order` result. Changed prices or stock show exactly what changed and update the cart, then wait for the customer to order again; other failures keep the cart untouched.
- Order confirmation at `/orders/[id]`, loaded from the database: order number, customer details, payment method, items, total, and Pending status.
- `src/proxy.ts`: returns a real 404 status for missing or inactive products and unknown orders.
- Unit tests for the cart module, the checkout schema, and turning `cart_changed` into cart updates.

### Changed
- The product details page now blocks on the product itself (no route-level loading screen); only the related products stream in.
- `/cart` is now the real cart instead of a placeholder.

## [0.2.0] - 2026-11-06

### Added
- Home page per the design: split hero under the glass nav, four featured products, giant stacked category links, and three value cards.
- Product listing at `/products` with case-insensitive name search, category chips, and price sort, all kept in the URL and applied in the database query. Shows a result count, stock availability ("In stock", "Only N left", "Out of stock"), and an empty state with Clear filters.
- Product details at `/products/[slug]` with a quantity selector (1 to stock) and up to three related products from the same category.
- "This one's off the shelf" page for unknown and inactive products.
- Category-gradient placeholder for any product whose image file doesn't exist yet.
- Add to cart button with out-of-stock state, shown disabled until the cart is built.
- Loading skeletons and page metadata for the listing and details pages.
- Placeholder `/cart` page so the nav's Cart link works until the cart is built.
- Unit tests for filter parsing, quantity limits, stock labels, and category order.

### Changed
- `public/products` is included in server file tracing so image checks also work on Vercel.

## [0.1.0] - 2026-11-06

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

[Unreleased]: https://github.com/diomnne/mondays-store/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/diomnne/mondays-store/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/diomnne/mondays-store/releases/tag/v0.1.0
