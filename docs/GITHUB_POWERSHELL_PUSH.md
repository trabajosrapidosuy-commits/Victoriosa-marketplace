# PowerShell - subir rama segura

```powershell
cd C:\CODEX-victoriosa-marketplace
git init
git branch -M main
git remote add origin https://github.com/trabajosrapidosuy-commits/Victoriosa-marketplace.git
git checkout -b codex/victoriosa-dropshipping-marketplace-foundation
git add .
git commit -m "Build Victoriosa dropshipping marketplace foundation"
git push -u origin codex/victoriosa-dropshipping-marketplace-foundation
```

Si aparece 403:

```powershell
gh auth status
gh api user --jq .login
git remote -v
```
