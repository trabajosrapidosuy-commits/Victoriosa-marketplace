# Victoriosa Private Admin Separation

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Decision

Victoriosa uses progressive separation inside the existing Next.js app.
Creating a monorepo or second deployment now would add migration risk without
improving the MVP security boundary.

The storefront and owner control center remain in one build but have separate
navigation, layout and server-side authorization.

## Public Storefront

- `/`
- `/productos`
- `/carrito`
- `/checkout`
- `/auth/login`
- `/auth/register`
- `/account`
- `/account/profile`
- `/account/settings`
- `/account/orders`
- `/wishlist`

The storefront header contains no admin or Autopilot link. No footer, sitemap
or mobile navigation exposes owner routes.

## Private Owner Surface

- `/admin`
- `/admin/autopilot`
- `/admin/autopilot/discovery`
- `/admin/autopilot/candidates`
- `/admin/marketplace/products/review`
- `/admin/marketplace/products/import`
- `/admin/marketplace/orders`
- `/admin/marketplace/suppliers`
- `/owner` redirects authorized owners to `/admin`
- `/owner/autopilot` redirects authorized owners to `/admin/autopilot`

Private routes render the `Victoriosa Studio` layout and omit the storefront
header. Their metadata is `noindex, nofollow`.

## Security Boundary

1. `src/middleware.ts` refreshes Supabase sessions and redirects anonymous
   `/admin` and `/owner` requests to login before render.
2. `requireAdmin()` checks the authenticated profile server-side.
3. Only `admin` and `marketplace_admin` roles pass `isAdminRole()`.
4. Admin pages and Autopilot server actions call `requireAdmin()`.
5. Supabase RLS hides internal Autopilot tables from anonymous and normal users.
6. The profile role-escalation trigger blocks self-promotion.

UI hiding is only presentation isolation. Server auth and RLS remain the real
security controls.

## Future Extraction

When staging flows stabilize, move owner routes and services to a separate
private Vercel project or owner subdomain. Preserve the existing helpers,
admin-only APIs and RLS policies during that extraction.
