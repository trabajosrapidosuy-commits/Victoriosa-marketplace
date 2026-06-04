# Victoriosa unificado - deploy seguro

Este ZIP está armado tomando como base `C:\victoriosa-premium-zen-ui-reference-polish`, conservando extras seguros de `C:\victoriosa` y dejando fuera archivos de entorno, secretos, builds locales y copias accidentales.

## Qué corrige/mejora

- Restaura el hero premium/zen de Victoriosa.
- Incluye la imagen editorial aprobada: `public/victoriosa-hero-editorial.png`.
- Agrega versión optimizada de marca: `public/brand/sofia-victoria-hero.jpg`.
- Agrega versión mobile optimizada: `public/brand/sofia-victoria-hero-mobile.jpg`.
- Mantiene el fallback `public/placeholder-product.svg` solamente como respaldo.
- Mantiene estructura Supabase, RLS, Autopilot, admin y marketplace.
- Mantiene `.env.example` con `NEXT_PUBLIC_SITE_URL=https://victoriosa.click`.
- Limpia `.gitignore` para evitar subir `.env.rls`, `.next`, `.vercel`, logs, secretos OAuth y copias accidentales.

## Cómo aplicar en Windows

1. Descomprimir este ZIP en una carpeta temporal, por ejemplo `C:\victoriosa-unificado`.
2. Hacer backup de tu carpeta actual:

```powershell
Rename-Item C:\victoriosa C:\victoriosa-backup-antes-unificado
```

3. Mover la carpeta descomprimida:

```powershell
Move-Item C:\victoriosa-unificado C:\victoriosa
```

4. Instalar y validar:

```powershell
cd C:\victoriosa
npm ci
npm run ci
```

5. Subir a GitHub:

```powershell
git status --short
git add .
git commit -m "fix(ui): restore Victoriosa premium zen experience"
git push origin main
```

6. En Vercel, hacer redeploy del proyecto conectado a `main`.

## Verificación rápida del hero

```powershell
Test-Path C:\victoriosa\public\brand\sofia-victoria-hero.jpg
Test-Path C:\victoriosa\public\brand\sofia-victoria-hero-mobile.jpg
Test-Path C:\victoriosa\public\victoriosa-hero-editorial.png
```

Las tres respuestas deben ser `True`.

## No incluido por seguridad

- `.git/`
- `.next/`
- `.vercel/`
- `.codex/`
- `node_modules/`
- `.env`, `.env.local`, `.env.rls`
- logs
- `client_secret_*.json`
- copias accidentales como `page.tsx1`, `globals.css1`, `*.csv1`
