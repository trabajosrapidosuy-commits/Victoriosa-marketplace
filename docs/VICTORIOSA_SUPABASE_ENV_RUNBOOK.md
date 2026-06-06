# Victoriosa Supabase Env Runbook

## Objetivo

Diagnosticar y corregir el error `Invalid API key` sin exponer secretos y sin
romper la home publica.

## Causa probable

El error indica que la app si esta leyendo una key, pero Supabase la rechaza.
Las causas mas probables son:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` de otro proyecto
- key recortada o placeholder
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` mezcladas entre proyectos
- variables actualizadas sin reiniciar `npm run dev`
- variables cargadas en local pero no en Vercel Preview/Production

## Variables requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Fuente correcta

- Supabase Dashboard -> Project Settings -> API
- copiar URL y anon/publishable key del mismo proyecto

## Donde cargarlas

- local: `.env.local` o mecanismo local seguro equivalente
- Vercel Preview: Project -> Settings -> Environment Variables
- Vercel Production: Project -> Settings -> Environment Variables

## Reglas

- nunca usar `SUPABASE_SERVICE_ROLE_KEY` en cliente, middleware publico o rutas publicas
- no commitear `.env.local`
- URL y key deben pertenecer al mismo proyecto
- luego de cambiar env local: reiniciar `npm run dev`
- luego de cambiar env en Vercel: redeploy

## Validacion local

```bash
npm run check:supabase-env
```

El script:

- valida formato de URL
- valida que la key no sea placeholder
- carga `.env` y `.env.local` si existen
- enmascara la key en salida
- intenta una verificacion remota segura del endpoint de auth
- devuelve `1` si detecta formato invalido o `INVALID_API_KEY`

## Mitigacion implementada en codigo

- helper central:
  - `src/lib/supabase/env.ts`
- cliente browser y server usan solo:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `src/services/public-catalog-service.ts` degrada a catalogo vacio si Supabase falla
- `src/middleware.ts` ya no rompe rutas publicas si el env publico es invalido

## Estado esperado post-fix

- home publica no cae
- `/productos` no cae
- se registran errores tecnicos solo en logs
- admin/private siguen protegidas
- no se exponen secretos
