# Cycle: Victoriosa Supabase API Fix And Kbeauty Autopilot

## Scope

- harden public Supabase env handling
- prevent public catalog/home SSR crash on catalog failure
- prepare local K-beauty review-only research assets
- keep all product and brand work in admin-only/review-only mode

## Decisions

- public catalog degrades to `[]` or `null` instead of crashing
- middleware now tolerates invalid public Supabase env on public routes
- env validation is centralized in `src/lib/supabase/env.ts`
- K-beauty work remains local-only and draft/review-only
- no remote migration apply
- no seed write executed

## Files touched

- `src/lib/supabase/env.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase.ts`
- `src/middleware.ts`
- `src/services/public-catalog-service.ts`
- `src/repositories/marketplace-repository.ts`
- `scripts/check-supabase-env.mjs`
- `scripts/seed-autopilot-kbeauty-candidates.mjs`
- `data/kbeautyAutopilotSeed.js`
- `src/services/autopilot/brand-scoring-service.ts`
- `src/services/autopilot/product-scoring-service.ts`
- `supabase/migrations/20260605000100_victoriosa_kbeauty_research_review_only.sql`

## Checks

- `npm run secret:scan`: PASS
- `npm run check:supabase-env`: PASS, `.env.local` loader + remote probe `REMOTE_OK`
- `npm run production:check`: PASS
- `npm run guard:no-production-deploy`: PASS
- `npm run test:rls:static`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run test`: PASS, 27 files / 96 tests
- `npm run build`: PASS
- `npm run smoke:structure`: PASS
- `git diff --check`: PASS

## Remaining risks

- human env correction still required if anon key and URL belong to different Supabase projects
- KRX and any professional peel products need stricter regulatory review
- image/brand permissions remain pending

## Migration status

- local migration prepared:
  - `20260605000100_victoriosa_kbeauty_research_review_only.sql`
- remote apply:
  - `NOT_EXECUTED`

## Recommended next step

Execute a controlled local review of `npm run check:supabase-env`, then run the
full local battery and keep seed in dry-run until non-production write context
is explicitly confirmed.
