# Cycle: Victoriosa Autopilot Admin Menu Web Supabase Preview

## Mode

`VICTORIOSA_AUTOPILOT_ADMIN_MENU_WEB_SUPABASE_PREVIEW`

## Scope

- Keep `/admin/autopilot` private and server-guarded
- Load persisted Autopilot candidates with Supabase SSR when available
- Render a safe fallback when Supabase candidate data is unavailable
- Expose web fields needed for review:
  - `status`
  - `recommendation`
  - `complianceDecision`
  - `blockers`
  - `warnings`
  - `score/risk`
  - `updatedAt/createdAt`
- Preserve review-only import boundary:
  - `draft + needs_review`

## Implementation

- Added safe admin web snapshot service:
  - `src/services/autopilot-web-service.ts`
- Updated dashboard:
  - `src/app/admin/autopilot/page.tsx`
- Updated candidates and review routes:
  - `src/app/admin/autopilot/candidates/page.tsx`
  - `src/app/admin/autopilot/review/page.tsx`
- Updated admin title:
  - `src/app/admin/autopilot/layout.tsx`
- Updated table to show review metadata:
  - `src/components/autopilot/AutopilotCandidateTable.tsx`
- Added focused tests for mapping and safe fallback

## Safety

- `requireAdmin()` preserved
- no public navigation exposure
- no `service_role` in client
- no publication path added
- no live providers enabled
- no production or remote mutation

## Fallback

If candidate queries fail, the admin routes render:

`Supabase Autopilot data unavailable in this environment`

This keeps the private surface reviewable in local and Preview without inventing live data.

## Checks

- `npm run secret:scan`: PASS
- `npm run production:check`: PASS
- `npm run guard:no-production-deploy`: PASS
- `npm run test:rls:static`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run test`: PASS, 24 files / 86 tests
- `npm run build`: PASS
- `npm run smoke:structure`: PASS
- `git diff --check`: PASS

## Result

- `/admin/autopilot` ready for local review
- Supabase connection status visible
- candidate table now exposes recommendation/compliance/blockers/warnings
- import boundary still review-only
- Preview-ready from code perspective

## Production

`PRODUCTION_STATUS=NO-GO_PRODUCTION`
