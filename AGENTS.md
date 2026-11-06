<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Mondays: project context

A take-home assessment for a web development internship at CubeTech Innovations: a responsive e-commerce site for a fictional cosmetics brand called **Mondays**, with a customer storefront and an admin dashboard sharing one Supabase database. The design and brand guide are done, and the database is live and seeded. The author must be able to explain, test, and trace every part of this code in an interview, so favor clear, conventional code over clever code.

## Stack
- Next.js App Router with TypeScript in strict mode. Installed: **Next 16.4.5**, React 19.3. Follow this version's conventions (for example, Next 16 renamed `middleware.ts` to `proxy.ts`; `error.tsx` receives `retry`, not `reset`).
- Tailwind CSS v4 (through the `@tailwindcss/turbopack` loader, no PostCSS config) and shadcn/ui (`radix-nova` style, Radix primitives), themed to the brand guide below.
- Supabase Postgres, already created and seeded. Use `@supabase/supabase-js` on the server only, with the secret key.
- `zod` for validation, `jose` for signing the admin session cookie, and `vitest` for unit tests.
- Deployment target: Vercel.

## Environment variables (server-only, never `NEXT_PUBLIC_`)
```
SUPABASE_URL=            # project URL only: https://<ref>.supabase.co (no /rest/v1)
SUPABASE_SECRET_KEY=
ADMIN_EMAIL=admin@mondays.example
ADMIN_PASSWORD=mondays-demo
ADMIN_SESSION_SECRET=   # 32+ random chars
```
Keep `.env.example` in sync with placeholder values. Nothing in this app needs a `NEXT_PUBLIC_` variable.

## Git workflow and versioning
- `main` is releases only. `dev` is the integration branch. Work happens on feature branches cut from `dev`: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`.
- **Only the user makes commits.** The agent never runs git commands that change the repo or the remote: no `branch`/`checkout -b`/`switch -c`, `add`, `commit`, `merge`, `rebase`, `tag`, `push`, `reset`, or `stash`. Read-only commands like `git status`, `git diff`, and `git log` are fine.
- Instead, at the end of each phase, propose the commits: group the changed files into small, focused commits, each with a Conventional Commit message (`feat(cart): merge duplicate lines`) and the exact `git add` and `git commit` commands to copy. Never include `.env.local`.
- The user creates feature branches, merges them into `dev` with `--no-ff`, and handles releases. At each milestone the agent prepares the release files (bump `package.json` to the new version and move `[Unreleased]` entries in `CHANGELOG.md`, Keep a Changelog format, into the new version), then gives the commands to merge `dev` into `main` and tag `vX.Y.Z`.
- Milestones:
  - `0.1.0`: foundations
  - `0.2.0`: storefront browsing
  - `0.3.0`: cart, checkout, confirmation
  - `0.4.0`: admin auth
  - `0.5.0`: admin dashboard
  - `1.0.0`: tested, documented, deployed submission
- If a git operation seems needed mid-phase, stop and say so instead of doing it.

## Folder structure
```
src/
  app/
    (shop)/                     # customer site, shared header and footer
      page.tsx                  # home
      products/page.tsx         # listing (search, filter, sort via searchParams)
      products/[slug]/page.tsx  # details (inactive or missing → not-found)
      cart/page.tsx
      checkout/page.tsx
      orders/[id]/page.tsx      # confirmation, loaded from the DB by order uuid
    admin/
      login/page.tsx
      (dashboard)/              # guarded and shares the sidebar layout
        page.tsx                # overview
        products/…, categories/…, orders/…, customers/…
    layout.tsx, globals.css, not-found.tsx, error.tsx
  components/
    ui/                         # shadcn primitives only
    shop/, admin/, shared/      # feature components
  lib/
    supabase/server.ts          # 'server-only' service client
    data/                       # server-only read functions per domain
    actions/                    # server actions per domain ('use server')
    validation/                 # zod schemas shared by client and server
    money.ts, order-status.ts, product-status.ts, category-theme.ts, auth/session.ts, utils.ts
  types/                        # database.ts (Supabase schema type), catalog.ts, order.ts, cart.ts, action-result.ts
supabase/migrations/, supabase/seed.sql, supabase/README.md
docs/  (test-log.md, ai-usage.md, screenshots/)
public/products/
```

## Next.js rules
- Use Server Components by default. Add `'use client'` only on small interactive leaves (cart controls, quantity steppers, filters, forms that need pending state).
- Read data in Server Components through `lib/data/*`. Never fetch your own API routes from the server. Every module that touches Supabase or secrets starts with `import 'server-only'`.
- Do mutations with Server Actions: validate with zod, call Supabase, `revalidatePath` what changed, and return typed results (`{ ok: true, … } | { ok: false, code, errors? }`) instead of throwing on expected failures.
- Pages that show database data must render fresh on every request, because admin changes have to appear on refresh. **This app has `cacheComponents: true`**, so route segment config like `export const dynamic` is not available. The mechanism: every `lib/data/*` function calls `await connection()` (from `next/server`) before querying, never uses `'use cache'`, and the component that awaits it sits inside `<Suspense>` (or under a `loading.tsx`).
- Put filters, search, and sort in the URL (`searchParams`) so they survive refresh and can be shared.
- Add `loading.tsx`, `error.tsx`, and `not-found.tsx` where they matter, and per-page `metadata`.
- Use `next/font` for fonts and `next/image` for images.
- Forms use `useActionState` and `useFormStatus` for pending and error states. The submit button is disabled while saving.

## Database (already live; don't change it from app code)
- **Tables:**
  - `categories` (`id`, `name`, `created_at`). There is **no slug column**; category filters match by name, ignoring case (`/products?category=lips`).
  - `products` (`category_id`, `name`, `slug`, `description`, `image_url`, `price_cents`, `stock`, `is_active`, `is_featured`, timestamps).
  - `orders` (status enum, `payment_method` enum, `total_cents`, `order_number` like MON-0009, `stock_restored_at`, customer fields, `notes`).
  - `order_items` (snapshot `product_name` and `unit_price_cents`, `quantity`, plus a generated `line_total_cents`).
- **Views:** `dashboard_stats` (the six overview figures: `total_products`, `total_orders`, `pending_orders`, `completed_orders`, `total_customers`, `total_sales_cents`) and `customer_summary` (one row per normalized email: `email`, `name`, `contact_number`, `order_count`, `completed_total_cents`).
- **RPC `place_order(p_customer_name, p_customer_email, p_contact_number, p_delivery_address, p_payment_method, p_notes, p_items)`.** `p_items` is `[{product_id, quantity, expected_unit_price_cents}]`. In one transaction it validates, locks the products, rechecks active, stock, and price, then saves the order, its items, and the stock change together. It returns `{ok:true, order_id, order_number, total_cents}` or `{ok:false, code}` with code `invalid_fields` (plus `errors`), `empty_cart`, `invalid_items`, or `cart_changed` (plus `changes[]` with reason `unavailable`, `insufficient_stock`, or `price_changed`).
- **RPC `update_order_status(p_order_id, p_new_status)`.** Allows one step forward through pending → confirmed → preparing → shipped → completed, or cancellation from pending or confirmed, which restores stock exactly once. Returns `{ok, status}` or `{ok:false, code:'invalid_transition'|'not_found'|'invalid_status'}`.
- **Enforced in the database:** a product referenced by an order can't be deleted (FK error `23503`, so offer "mark inactive" instead). A category in use can't be deleted (`23503`). Duplicate category names ignoring case fail with `23505`. Price must be greater than 0 and stock a whole number of at least 0.
- **Access:** RLS is on with no policies. Only the secret key works.
- **Schema changes:** add a new timestamped file in `supabase/migrations/`. Never edit the existing migration. The user runs SQL in the Supabase dashboard; give them the SQL and don't run destructive commands.
- `src/types/database.ts` mirrors this schema by hand. Update it with any schema change.

## Money and status rules
- Store and calculate everything in integer centavos. Format only at display time: `PHP 1,077.00`, always two decimals, with the "PHP " prefix. Use `formatPHP`, `lineTotal`, and `sumCents` from `lib/money.ts`.
- Subtotal equals total. There's no shipping, tax, or fees.
- Map status enums to labels: `pending` → Pending, and so on. Payment methods: `cash_on_delivery` → Cash on Delivery, `e_wallet` → E-Wallet, `bank_transfer` → Bank Transfer. (`lib/order-status.ts`)

## Requirements checklist (every one must be met)
**Storefront**
- **Home:** logo, nav to working pages, promo banner, category links, featured products (`is_featured`), and a footer with clearly labeled fictional contact details and social links.
- **Listing:** image, name, price, category, stock availability, View details, and Add to cart for each product. Case-insensitive name search, category filter, and price sort (low to high, high to low), all working together. Responsive grid and a clear empty state. Inactive products are hidden. An active product with 0 stock is visible, labeled "Out of stock", with Add to cart disabled.
- **Details:** image, name, price, description, available stock, and a quantity selector from 1 up to stock. Up to 3 related active products from the same category, excluding the current one; omit the section if there are none. Inactive or unknown slugs show the unavailable / not-found page and can't be ordered.
- **Cart:** saved in localStorage as `{productId, quantity}[]` only. Never trust stored prices: load current price and stock from the server. Adding an existing product increases its quantity. Quantity is a positive whole number, capped at stock. Show unit price, quantity, line total, subtotal, and total. Items can be removed. The cart survives refresh. Checkout is blocked when the cart is empty. Must pass: 2 × PHP 120.00 + 1 × PHP 85.50 = PHP 325.50.
- **Checkout:** name (reject whitespace-only), email (valid format), contact number (required, common formatting allowed), a single delivery address field, payment method (one of the three, selection only), optional notes. Show items, quantities, current unit prices, line totals, and the total before submitting. Validate on the client for UX and on the server for real, via zod and `place_order`. On `cart_changed`, show exactly what changed, update the cart to match, and require the customer to review before trying again. On failure, show a useful error and keep the cart. On success, redirect to `/orders/[uuid]` and clear the cart only after the order is confirmed saved.
- **Confirmation:** order number, customer details, payment method, item summary, total, and Pending status. It is never shown if saving failed.

**Admin**
- **Auth:** simulated login checked on the server against the env credentials, then a signed httpOnly, secure, sameSite=lax cookie with an 8h expiry. The proxy guards `/admin/*` except `/admin/login`, and every admin Server Action re-verifies the session itself. Log out clears the cookie. Label it in the UI and README as simulated and not production-safe.
- **Overview:** Total products (including inactive), Total orders (including cancelled), Pending, Completed, Total customers (unique normalized emails), Total sales (Completed orders only). Read these from `dashboard_stats`.
- **Products:** list, search, filter by category and by status (Active, Inactive, Out of stock), add, edit, delete with confirmation. Fields: name, image URL or bundled path, category, description, price, stock, Active/Inactive. Validate required fields, price greater than 0, and whole-number stock of at least 0. If a product is referenced by an order, block the delete and offer "Mark inactive".
- **Categories:** view, add, edit, delete. The name is required and unique ignoring case. Deleting a category in use is blocked with an explanation.
- **Orders:** newest first, showing order number, customer, date and time, total, payment method, status, and View details. Has an empty state and a manual refresh.
- **Order details:** customer and contact info, address, items with quantities, unit prices, and line totals, subtotal, total, payment method, status, and notes. Only valid transitions are offered. Show feedback on success and an error on failure.
- **Customers:** read-only from `customer_summary`: name, email, contact number, order count, completed total.

**Everywhere**
- Works at 375px and 1280px with no clipped controls, no horizontal page scrolling, and no console errors.
- Accessible markup: labels, focus states, real buttons and links, at least 44px touch targets, and 4.5:1 contrast.
- Out of scope: real payments, shipping, tax, refunds, customer accounts.

## Brand guide (apply through theme tokens in `globals.css`, not one-off hex values)
- **Colors:**
  - Paper `#EFF1F1`: page background.
  - Ink `#1E2125`: text, secondary buttons, footer.
  - Rose `#DCA9B6`: the Lips category.
  - Powder `#A9BDD0`: the Face category.
  - Sage `#A5BDB1`: the Skin category.
  - Lilac `#A48CF5`: accent only, used for the primary action, active filter chip, cart count badge, and promo strip.
  - Support colors: muted text `#3A3F46`, borders `#D8DDE0`, input borders `#9AA2AA`, errors and destructive `#9B2C42`, error background `#F6E3E8`.
  - Text on every brand color is ink.
- **shadcn mapping:** `background` = paper, `foreground` = ink, `primary` = lilac with ink foreground, `secondary` = ink with paper foreground, `border` = `#D8DDE0`, `input` = `#9AA2AA`, `ring` = lilac, `destructive` = `#9B2C42` (`destructive-soft` = `#F6E3E8`), `muted-foreground` = `#3A3F46`, `card` = white. Custom tokens: `paper`, `ink`, `rose`, `powder`, `sage`, `lilac`, `status-*`. Category→color map: `lib/category-theme.ts`.
- **Gradients** (utilities `bg-gradient-rose|powder|sage|header`): one color only, from a pale tint to the base at 160deg:
  - Rose: `#ECCAD3` → `#DCA9B6`
  - Powder: `#CBD8E5` → `#A9BDD0`
  - Sage: `#C9DBD1` → `#A5BDB1`
  - Header band: `#E9EEF2` → `#DCE4EA`
  - Never blend across colors, never use purple-to-blue, and never put a gradient on buttons, text, or the wordmark.
- **Type:**
  - Calistoga for display: headings and the wordmark (`font-heading`; h1–h3 get it by default). It has one weight, so never bold it.
  - Schibsted Grotesk 400/500/700 for body and all admin UI (`font-sans`). Scale 20/17/15/13 = `text-title` / `text-lead` / `text-body` / `text-caption`.
  - Sentence case everywhere.
- **Shape:** pill (`rounded-full`) for buttons, chips, and the nav; 14px (`rounded-lg`) for inputs; `rounded-card` (26px) for cards and product tiles; `rounded-footer` (40px) for the footer card.
- **Glass** (`glass` utility): paper at 65% opacity, `backdrop-blur` 18px, a 1px white border at 55%, ink text, with the `-webkit-` prefix and a solid paper fallback. Use it only on floating layers over color: the nav pill, Add to cart buttons on product tiles (`<Button variant="glass">`), dialogs and sheets, and the admin sidebar. Forms, tables, and long text stay solid.
- **Buttons:** primary/`default` (lilac) for one main action per area; `secondary` (ink) for repeated actions like Add to cart; `outline` for secondary; `destructive` (red outline) for destructive. All sizes are at least 44px tall.
- **Focus:** lilac alone is under 3:1 on paper, so buttons pair the lilac ring with an ink offset, fields get an ink border plus the lilac ring, and anything else gets a 2px ink outline.
- **Status badges** (tokens `status-<name>` / `status-<name>-foreground`, classes in `lib/order-status.ts`):

  | Status | Background | Text |
  |---|---|---|
  | Pending | `#E4DCFD` | `#3B2E7A` |
  | Confirmed | `#DDE6EF` | `#23384D` |
  | Preparing | `#F1DDE3` | `#5A2B3A` |
  | Shipped | white with an ink ring | ink |
  | Completed | `#DCE7E1` | `#23392F` |
  | Cancelled | `#E3E5E7` | `#4A4F57` |

  Product statuses use Active = completed colors, Inactive = cancelled colors, Out of stock = preparing colors (`lib/product-status.ts`).
- **Wordmark:** lowercase "mondays" in Calistoga, in ink or paper only (`components/shared/wordmark.tsx`).
- **Voice:** dry, warm, short. No exclamation marks, no emoji, no hype words.
- **Layout notes from the approved design:**
  - **Home:** promo strip, then a split hero (featured image on the left, headline "Easy on the face. Easy on the week." with a lilac "Shop all" button on the right) with the glass nav pill floating over it. Then 4 featured product tiles (gradient tile, product image, glass Add to cart, with name, description, and price centered underneath). Then giant stacked category links (Lips / Face / Skin). Then three value cards.
  - **Footer:** a rounded 40px ink card with columns, a fictional-store disclaimer, and a giant cropped "mondays" wordmark in paper.
  - **Admin:** a glass sidebar over a subtle gradient, solid cards and tables, and Calistoga page titles.
- **Images:** product images live at `/public/products/<slug>.jpg`. Until real images exist, render a placeholder tile using the product's category gradient. Images will be AI-generated and disclosed in the README.

## How to work with the user
- Work one phase at a time on its own branch. At the end of each phase, stop and give:
  - A plain-language summary of what was built and why.
  - The files that matter most.
  - How to test it manually.
  - Which brief acceptance checks it covers.
  - The proposed commits, with messages and copy-ready commands.
- Add short comments only where logic isn't obvious, especially money math, cart reconciliation, auth, and checkout error handling.
- Log meaningful AI-assisted decisions in `docs/ai-usage.md`, which feeds the README's AI disclosure.
- Ask before adding a dependency that isn't listed here.

## Decisions log
- **Phase 1:** the app lives in `src/` (moved from the root `app/` that create-next-app made); the `@/*` alias points to `./src/*`.
- **Phase 1:** with Cache Components on, freshness comes from `connection()` + `<Suspense>` (see Next.js rules).
- **Phase 1:** shadcn init (`radix-nova`) added `radix-ui`, `class-variance-authority`, `lucide-react`, `sonner`, `tw-animate-css`, `shadcn` (for `shadcn/tailwind.css`), and `cn` (shadcn's class merger, used by every primitive). `next-themes` was removed; the app is light-only.
- **Phase 1:** `@types/node` was bumped from ^20 to ^24 (matches Node 24) because vitest 5 needs ≥22.
- **Phase 1:** `SUPABASE_URL` must be the bare project URL. `lib/supabase/server.ts` throws a clear error if it has a path such as `/rest/v1/`.
- **Phase 1:** `types/database.ts` is written by hand from `supabase/migrations/20261106000000_init.sql`. `products.description` (default `''`) and `image_url` are NOT NULL. The RPCs take `text` for payment method and status; the TS types narrow them to the enum unions. `place_order`'s `cart_changed` entries are typed as the `CartChange` union in `types/order.ts`.
