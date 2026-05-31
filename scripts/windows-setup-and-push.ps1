param(
  [string]$RepoUrl = "https://github.com/trabajosrapidosuy-commits/Victoriosa-marketplace.git",
  [string]$Branch = "codex/victoriosa-dropshipping-marketplace-foundation"
)

Write-Host "Victoriosa setup starting..." -ForegroundColor Magenta
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run secret:scan
npm run smoke:structure

if (-not (Test-Path .git)) {
  git init
  git branch -M main
}

git remote remove origin 2>$null
git remote add origin $RepoUrl
git checkout -B $Branch
git add .
git commit -m "Build Victoriosa dropshipping marketplace foundation"
git push -u origin $Branch
