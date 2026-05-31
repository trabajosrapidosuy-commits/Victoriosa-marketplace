# Instrucciones rapidas para Ronald

## 1. Descomprimir

Descomprime este ZIP preferentemente en:

```powershell
C:\CODEX-victoriosa-marketplace
```

Si ya existe `C:\Victoriosa`, no lo pises sin respaldo. Usa una carpeta limpia o crea una rama antes.

## 2. Leer primero

La IA/Copilot/Codex debe leer:

```text
docs/IA_DIRECTOR_VICTORIOSA_MARKETPLACE.pdf
docs/IA_DIRECTOR_VICTORIOSA_MARKETPLACE.md
```

## 3. Instalar y validar

```powershell
cd C:\CODEX-victoriosa-marketplace
npm install
copy .env.example .env.local
npm run lint
npm run typecheck
npm run test
npm run build
npm run secret:scan
npm run smoke:structure
```

## 4. Configurar Supabase

Completa `.env.local` con:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Nunca pegues el service role en el frontend.

## 5. Subir a GitHub

```powershell
git init
git branch -M main
git remote add origin https://github.com/trabajosrapidosuy-commits/Victoriosa-marketplace.git
git checkout -b codex/victoriosa-dropshipping-marketplace-foundation
git add .
git commit -m "Build Victoriosa dropshipping marketplace foundation"
git push -u origin codex/victoriosa-dropshipping-marketplace-foundation
```

Si aparece 403, revisar:

```powershell
gh auth status
gh api user --jq .login
git remote -v
```
