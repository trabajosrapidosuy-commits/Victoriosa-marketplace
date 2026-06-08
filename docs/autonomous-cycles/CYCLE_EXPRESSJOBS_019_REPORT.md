# ExpressJobs Director Cycle 019

Canonical project: Victoriosa Marketplace

- Mode: `VICTORIOSA_PASSWORD_RECOVERY_PKCE_FIX`
- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-staging-enable`
- HEAD: `6aeb853`
- Supabase staging: `ngliugfcwydnfbpalkpb`
- Production: `NO-GO_PRODUCTION`

## Result

- Recovery emails now enter through the server callback before showing the
  password form.
- Existing direct reset links carrying `code` are forwarded to the callback.
- Failed PKCE exchanges return a generic recovery error without verifier
  details.
- Synthetic invalid-code browser smoke: `PASS_FAIL_CLOSED`
- A token pasted into chat was not reused or stored.

## Checks

- `secret:scan`: `PASS`
- `production:check`: `PASS`
- `guard:no-production-deploy`: `PASS`
- `test:rls:static`: `PASS_25_PUBLIC_TABLES`
- `lint`: `PASS`
- `typecheck`: `PASS`
- focused tests: `PASS_2_FILES_12_TESTS`
- full tests: `PASS_33_FILES_115_TESTS`
- `build --debug`: `PASS`
- `git diff --check`: `PASS`
- `staging:check`: `CHECK_NOT_RUN_MISSING_STAGING_VARS`
- `rls:smoke`: `CHECK_NOT_RUN_MISSING_STAGING_VARS`
- Fresh real recovery link: `CHECK_NOT_RUN_USER_SECRET_REQUIRED`

## Safety

- Production touched: `NO`
- Deploy executed: `NO`
- Database mutation: `NO`
- Secrets exposed by Codex: `NO`
- Products published: `NO`
- Official brand representation asserted: `NO`

Decision: `GO_PASSWORD_RECOVERY_CODE_FIXED`

Blocker: `BLOCKED_EXTERNAL_CREDENTIALS` for the final positive smoke because it
requires mailbox access, a fresh single-use recovery link and a user-selected
password.

Next mode: `VICTORIOSA_PASSWORD_RECOVERY_FRESH_LINK_SMOKE`

## NEXT_CODEX_PROMPT

Repository: `C:\victoriosa-autopilot-admin-control-center`

Suggested branch: `codex/victoriosa-autopilot-staging-enable`

Objective: verify the fixed password recovery flow with a newly requested,
single-use link without exposing the link or password.

Context:

- Recovery links now route through `/auth/callback`.
- Direct reset links with `code` are rescued through the callback.
- Invalid-code smoke and all local checks pass.

Safety:

- Keep `PRODUCTION_STATUS=NO-GO_PRODUCTION`.
- Do not paste recovery URLs, OTPs, cookies or passwords into chat or docs.
- Do not change the final password on the user's behalf.
- No deploy, production mutation, payment, publication, schema changes,
  service-role client code or RLS relaxation.
- Preserve unrelated `tsconfig.json` and `.vscode` changes.

Tasks:

1. Request a new recovery email from the same browser that will open it.
2. Open the fresh link before it expires.
3. Confirm the reset form appears only after callback exchange.
4. Let the user choose and submit the final password.
5. Verify login with the new password and update Director documentation.

GO: fresh recovery link opens the reset form, password update succeeds and the
new password signs in.

NO-GO: expired link, cross-browser verifier loss, provider delivery failure,
raw auth error disclosure or production risk.
