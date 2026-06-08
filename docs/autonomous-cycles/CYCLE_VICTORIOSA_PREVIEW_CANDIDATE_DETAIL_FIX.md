# Victoriosa Preview Candidate Detail Fix

## Context

- Mode: `VICTORIOSA_PREVIEW_CANDIDATE_DETAIL_FIX`
- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-staging-enable`
- HEAD before: `fc791f7`
- Fix commit: `72a5a06`
- Supabase staging: `ngliugfcwydnfbpalkpb`
- Production: `NO-GO_PRODUCTION`

## SSR Cause And Fix

The K-beauty candidate detail failed because persisted legacy rows do not
always contain `scoring.explanation`, but the page called `.map()` directly.

The fix:

- normalizes explanation, strengths, weaknesses, blockers and warnings
- accepts array, string, object, null and undefined safely
- normalizes malformed risk flags
- preserves score, risk and compliance cards
- distinguishes eight K-beauty review-only candidates from ten total
  historical candidates

## Preview

- Deployment ID: `dpl_C3bSqX89VJurLDb5aJUUXCQHo9iS`
- URL:
  `https://victoriosa-marketplace-k32hs2umj-akuma424-projects.vercel.app`
- Target: `preview`
- Status: `READY`
- Production deployment: `NO`

## Staging Evidence

- Candidates total: `10`
- K-beauty candidates: `8`
- K-beauty `pending_admin_review`: `8`
- Published products: `0`
- Draft + needs_review products: `3`
- Supplier contacts sent or advanced: `0`
- Campaigns enabled: `0`
- Official representation claims: `0`
- RLS internal tables: `PASS_13`

## Checks

- `secret:scan`: `PASS`
- `production:check`: `PASS`
- `guard:no-production-deploy`: `PASS`
- `test:rls:static`: `PASS_25_PUBLIC_TABLES`
- `lint`: `PASS`
- `typecheck`: `PASS`
- `test`: `PASS_35_FILES_124_TESTS`
- `build`: `PASS`
- `git diff --check`: `PASS`
- `.env.local` ignored and untracked: `PASS`
- `staging:check`: `PASS`
- `rls:smoke`: `PASS_13_INTERNAL_TABLES`
- K-beauty persistence: `PASS_READY`

## Smoke

- Unauthenticated `/admin/autopilot` guard: `PASS`
- Non-admin guard: `CHECK_NOT_RUN_NO_SAFE_SESSION`
- Authenticated `/admin/autopilot` after this deployment:
  `CHECK_NOT_RUN_HUMAN_SESSION_UNAVAILABLE`
- Candidate detail after this deployment:
  `CHECK_NOT_RUN_HUMAN_SESSION_UNAVAILABLE`
- Score/risk/compliance visible:
  `CHECK_NOT_RUN_HUMAN_SESSION_UNAVAILABLE`
- Blockers/warnings visible:
  `CHECK_NOT_RUN_HUMAN_SESSION_UNAVAILABLE`
- Runs/drafts/review queue:
  `CHECK_NOT_RUN_HUMAN_SESSION_UNAVAILABLE`

No matching SSR exception appeared in the available Preview logs after
deployment, but that is not sufficient evidence of a successful authenticated
detail render.

## Safety

- Production touched: `NO`
- Productive deploy: `NO`
- Database mutation: `NO`
- Migration/db push/seed: `NO`
- Candidate mutations/imports: `NO`
- Published products created: `NO`
- Payments: `NO`
- Supplier contacts: `0`
- Campaigns enabled: `0`
- Official representation asserted: `NO`
- Secrets exposed: `NO`

## Decision

`PENDING_HUMAN_DETAIL_SMOKE`

The code fix, checks, staging evidence and Preview deployment pass. Final GO
requires the existing human admin session to open the new Preview candidate
detail and confirm score, risk, compliance, blockers and warnings render.

## NEXT_CODEX_PROMPT

Repository: `C:\victoriosa-autopilot-admin-control-center`

Mode: `VICTORIOSA_PREVIEW_CANDIDATE_DETAIL_HUMAN_SMOKE`

Objective: use the already authenticated human admin session to perform a
read-only smoke on the stable branch Preview alias.

Safety:

- No production, deploy, database mutation, candidate action, publication,
  payment, supplier contact or campaign action.
- Do not print credentials, cookies, tokens, headers or session data.

Tasks:

1. Open `/admin/autopilot` on the stable branch Preview alias.
2. Confirm ten total candidates and eight K-beauty review-only candidates.
3. Open one K-beauty candidate detail.
4. Confirm score, risk, compliance, blockers, warnings and safe explanation
   rendering without SSR or Supabase errors.
5. Open runs, drafts and review queue read-only.
6. Record `GO_AUTOPILOT_STAGING_READY` only with direct visual evidence.
