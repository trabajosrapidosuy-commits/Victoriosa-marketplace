# Catalog Intelligence

Catalog Intelligence is an admin-only, review-only enrichment flow. `supplier_products` remains the immutable supplier source. `catalog_ai_runs` and `catalog_ai_results` retain execution and proposal history; rejected proposals are never deleted.

`catalog_products.ai_result` contains only the last human-approved structured proposal. Supplier syncs do not write `ai_result`, `ai_processed`, or `approved`.

AI execution is fail-closed: `CATALOG_AI_ENABLED=true`, an allowed development/preview/staging environment, `CATALOG_AI_MODEL`, administrator access, and AI Gateway authentication are all required. Production is always rejected. The service processes one selected product per run, fingerprints source content, skips unchanged sources, limits retries, tokens, and timeout, and never publishes products.

The output schema excludes price, stock, ingredients, technical characteristics, certifications, brands, and medical or therapeutic claims. Shopify and provider networking remain disconnected.
