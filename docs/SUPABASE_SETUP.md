# Supabase Setup

Variables necesarias:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` solo se usa server-side y nunca debe aparecer en cliente.

Aplicar migracion:

```powershell
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

Validar RLS antes de cargar datos reales.
