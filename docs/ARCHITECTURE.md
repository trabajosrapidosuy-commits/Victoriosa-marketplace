# Victoriosa Architecture

Victoriosa is a first-party ecommerce platform built with Next.js, Supabase and Vercel. Its future catalog path is:

```text
supplier → supplier_products → normalization → commercial rules → catalog_products
→ Catalog Intelligence → human review → published marketplace catalog → storefront → cart → order
```

## Bounded responsibilities

- `autopilot_*`: discovery, qualification and candidate review. It does not publish products.
- `supplier_products`: immutable external-source facts.
- `catalog_products`: normalized commercial proposal and deterministic score.
- `catalog_ai_*`: auditable, review-only enrichment proposals.
- `marketplace_*`: current storefront, manual order and review contract.

## Integrations

No Shopify runtime, tokens, webhooks or product publication path is part of the target architecture. Provider feeds and API connectors remain disabled until an authorized supplier, server-only credential configuration and reviewed security controls exist.

## Safety

Human approval is required before publication. Payments, supplier purchasing, provider networking and AI in production remain disabled by default.
