Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "== Victoriosa unified verification =="

$required = @(
  "public\brand\sofia-victoria-hero.jpg",
  "public\brand\sofia-victoria-hero-mobile.jpg",
  "public\victoriosa-hero-editorial.png",
  "src\app\page.tsx",
  "src\components\SiteHeaderClient.tsx",
  "src\lib\brand\sofia-hero.ts"
)

foreach ($file in $required) {
  if (-not (Test-Path $file)) {
    throw "Falta archivo requerido: $file"
  }
  Write-Host "OK $file"
}

$forbidden = @(".env", ".env.local", ".env.rls")
foreach ($file in $forbidden) {
  if (Test-Path $file) { throw "Archivo sensible presente. No subir: $file" }
}

$secretFiles = Get-ChildItem -Recurse -File -Filter "client_secret_*.json" -ErrorAction SilentlyContinue
if ($secretFiles.Count -gt 0) { throw "Hay client_secret_*.json dentro del proyecto. Eliminarlos antes de subir." }

npm ci
npm run ci

git status --short
Write-Host "Validacion terminada. Si los checks pasaron, puedes hacer git add/commit/push."
