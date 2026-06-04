# Victoriosa Sofia Hero Image Implementation Report

Date: 2026-06-02

Mode: `VICTORIOSA_SOFIA_HERO_IMAGE_IMPLEMENTATION`

Branch: `codex/victoriosa-zen-visual-redesign`

Worktree: `C:\victoriosa-zen-visual-redesign`

## Goal

Implement the Victoriosa home hero so it prefers approved Sofia Victoria brand
assets, preserves her real identity, and falls back safely when those assets do
not exist yet.

## Asset Resolution

The home hero now resolves assets in this order:

1. `public/brand/sofia-victoria-hero.jpg`
2. `public/brand/sofia-victoria-hero-mobile.jpg`
3. `public/victoriosa-hero-editorial.png`
4. `public/placeholder-product.svg`

Current detected asset in this branch:

`public/victoriosa-hero-editorial.png`

Expected brand assets are still missing in `public/brand/`.

## Implementation

- Added `src/lib/brand/sofia-hero.ts` to select approved desktop/mobile hero
  assets on the server.
- Preserved Sofia attribution only for approved Sofia assets or the already
  approved legacy editorial portrait.
- Added a neutral non-Sofia placeholder fallback if no approved Sofia asset is
  present.
- Updated the home hero to use `next/image` with desktop/mobile sources and
  responsive `sizes`.
- Replaced the broken caption text with a clean caption driven by the resolver.
- Added source tests that lock the hero contract and brand asset paths.

## Pending Asset Upload

Upload these files when the final approved Sofia portrait is ready:

- `public/brand/sofia-victoria-hero.jpg`
- `public/brand/sofia-victoria-hero-mobile.jpg`

No code changes should be required after upload.

## Safety

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

- No Production deploy.
- No Vercel promotion.
- No Production environment mutation.
- No live payments.
- No live providers.
- No public Google OAuth activation.
- No secrets printed.
- No RLS changes.
