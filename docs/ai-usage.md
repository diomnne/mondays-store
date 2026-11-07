# AI usage log

AI assistance (Claude Code) was used during development. Every change was reviewed, run, and tested by the author, who can explain it. This log records the meaningful decisions so the README disclosure is accurate.

| Date | Phase | What the AI did | What I decided or verified |
|---|---|---|---|
| 2026-11-06 | 1: foundations | Installed and themed shadcn/ui; wrote the Supabase server client, money and status helpers with unit tests, shared types, the shop layout shell, and a temporary home page; drafted these docs. | Approved the dependencies; checked the theme against the brand guide; ran build, lint, and tests. |
| 2026-11-06 | 2: storefront browsing | Built the home, listing, and details pages, the URL-driven filters, the image placeholder, and the not-found page; added unit tests; checked 375px and 1280px layouts with a headless Chrome script. | Reviewed the filter results against the seed data and the layouts against the design. |
| 2026-11-07 | 3: cart, checkout, confirmation | Built the cart module, store, and provider; the cart, checkout, and confirmation pages; the cart-check and place-order Server Actions; and the proxy for real 404s. Wrote unit tests and a scripted Chrome test that never saves an order. | Chose the proxy approach for real 404s; reviewed checkout error handling against each place_order result. |
| 2026-11-07 | 4: admin auth and overview | Wrote the session, token, and redirect helpers with unit tests; the proxy guard, login page, admin shell, and overview; and a scripted Chrome test of the login, logout, and tampering cases. | Reviewed the cookie flags and the layered checks (proxy plus `requireAdmin()` on every page and action). |

## Notable decisions
- **Fresh data with Cache Components.** The installed Next.js has `cacheComponents` on, so `export const dynamic` isn't allowed. Data functions call `await connection()` and render inside `<Suspense>`, so database reads always happen at request time.
- **Integer centavos.** All money is stored and calculated in whole centavos, and only formatted as `PHP 1,234.00` for display, which avoids floating-point rounding errors.
- **Schema types written by hand.** The Supabase `Database` type in `src/types/database.ts` was written by hand from the migration in `supabase/migrations/`, not generated.
- **Focus contrast.** Lilac is under 3:1 against the paper background, so focus states pair the lilac ring with ink (an offset or border) to stay visible.
- **Filters in the database.** Search uses `ilike` with LIKE wildcards escaped, the category filter matches by name because categories have no slug, and an unknown category returns no results rather than everything.
- **No broken images.** The server checks whether each product's image file exists and renders a category-gradient placeholder when it doesn't.
- **The browser is never trusted with money.** The cart stores ids and quantities only. Every price shown comes from the server, and at checkout the database rechecks price, stock, and availability inside one transaction before saving anything.
- **Real 404s through the proxy.** With Cache Components, a page's shell streams with a 200 before the page can call `notFound()`. The proxy checks first and rewrites missing records to static 404 pages.
- **Two layers of admin checks.** The proxy redirects logged-out visitors early, but Server Actions can be called directly and a matcher mistake would silently open a route, so every admin page and action also calls `requireAdmin()`.
- **No open redirect after login.** The `next` value comes from the URL, so only relative paths inside `/admin` are followed.
- **SUPABASE_URL check.** The server client rejects a URL with a path (such as `/rest/v1/`), because supabase-js adds that path itself and every request would otherwise fail with "Invalid path".
