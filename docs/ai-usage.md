# AI usage log

AI assistance (Claude Code) was used during development. Every change was reviewed, run, and tested by the author, who can explain it. This log records the meaningful decisions so the README disclosure is accurate.

| Date | Phase | What the AI did | What I decided or verified |
|---|---|---|---|
| 2026-11-06 | 1: foundations | Installed and themed shadcn/ui; wrote the Supabase server client, money and status helpers with unit tests, shared types, the shop layout shell, and a temporary home page; drafted these docs. | Approved the dependencies; checked the theme against the brand guide; ran build, lint, and tests. |

## Notable decisions
- **Fresh data with Cache Components.** The installed Next.js has `cacheComponents` on, so `export const dynamic` isn't allowed. Data functions call `await connection()` and render inside `<Suspense>`, so database reads always happen at request time.
- **Integer centavos.** All money is stored and calculated in whole centavos, and only formatted as `PHP 1,234.00` for display, which avoids floating-point rounding errors.
- **Schema types written by hand.** The Supabase `Database` type in `src/types/database.ts` was written by hand from the migration in `supabase/migrations/`, not generated.
- **Focus contrast.** Lilac is under 3:1 against the paper background, so focus states pair the lilac ring with ink (an offset or border) to stay visible.
- **SUPABASE_URL check.** The server client rejects a URL with a path (such as `/rest/v1/`), because supabase-js adds that path itself and every request would otherwise fail with "Invalid path".
