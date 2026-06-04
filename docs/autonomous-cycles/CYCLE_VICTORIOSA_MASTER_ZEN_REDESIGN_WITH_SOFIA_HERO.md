# Victoriosa Master Zen Redesign With Sofia Hero

Date: 2026-06-02

Mode: `VICTORIOSA_MASTER_ZEN_REDESIGN_WITH_SOFIA_HERO`

Branch: `codex/victoriosa-zen-visual-redesign`

Worktree: `C:\victoriosa-zen-visual-redesign`

## Scope

Redesigned the public home, header, product cards and footer toward a warmer,
quieter premium wellness identity without touching Production or sensitive
commerce/auth controls.

## Changes

- Rebuilt the home around `Tu belleza, en calma.` and Sofia Victoria founder
  positioning.
- Added hero trust pills, confidence band, rituals section, guidance section
  and editorial footer.
- Refined header/navigation spacing, typography, hover states and mobile
  overflow behavior.
- Refined product cards with softer media, badges, price hierarchy and quiet
  detail CTA.
- Reworked global public styling with ivory, sand, stone, muted rose, sage and
  espresso tokens.
- Added source tests for Sofia hero identity, trust pillars, no admin links and
  no unsafe medical claims.

## Sofia Hero Asset

The hero now resolves assets in this order:

1. `public/brand/sofia-victoria-hero.jpg`
2. `public/brand/sofia-victoria-hero-mobile.jpg` for mobile when available
3. fallback to the existing approved/documented asset
   `public/victoriosa-hero-editorial.png`
4. if neither Sofia asset exists, fallback to a neutral placeholder without
   naming Sofia

Current detected fallback in this branch:

`public/victoriosa-hero-editorial.png`

To switch to the final brand portrait, upload:

- `public/brand/sofia-victoria-hero.jpg`
- `public/brand/sofia-victoria-hero-mobile.jpg`

No code change should be required after upload because the hero now resolves the
brand assets automatically. Do not replace Sofia with a generic stock face.

## Evidence

- Focused typecheck: PASS.
- Focused lint: PASS.
- Focused tests: PASS, 12 tests.
- Local HTTP `/`: PASS HTTP `200`.
- Local HTTP `/productos`: PASS HTTP `200`.
- Browser smoke desktop: PASS, hero/Sofia/trust rendered.
- Browser smoke mobile 390x844: PASS, hero and CTA rendered.
- Screenshot desktop: `docs/screenshots/victoriosa-zen-home.png`.
- Screenshot mobile: `docs/screenshots/victoriosa-zen-home-mobile.png`.

## Safety

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

- No Production deploy.
- No Vercel promotion.
- No Production environment mutation.
- No live payments.
- No live providers.
- No public Google OAuth activation.
- No secrets printed.
- No RLS change.
- No automatic publication.
