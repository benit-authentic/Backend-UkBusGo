# Script PowerShell pour demarrer le serveur avec webhook FedaPay

Write-Host "🚀 Demarrage du serveur UkBus avec webhook FedaPay..." -ForegroundColor Green
Write-Host ""

# Demarrer le serveur en arriere-plan
Write-Host "📦 Demarrage du serveur sur le port 5000..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"

# Attendre que le serveur demarre
Start-Sleep -Seconds 3

# Instructions pour ngrok
Write-Host ""
Write-Host "🌐 Maintenant, ouvrez un NOUVEAU terminal et tapez:" -ForegroundColor Cyan
Write-Host "   ngrok http 5000" -ForegroundColor White
Write-Host ""
Write-Host "✅ Ensuite suivez ces etapes :" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Instructions :" -ForegroundColor Yellow
Write-Host "1. Dans le terminal ngrok, copiez l'URL HTTPS" -ForegroundColor White
Write-Host "2. Votre URL webhook sera: https://VOTRE-URL.ngrok.io/api/fedapay/webhook" -ForegroundColor White
Write-Host "3. Allez sur https://dashboard.fedapay.com" -ForegroundColor White
Write-Host "4. Creez un webhook avec cette URL" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Mettez a jour votre fichier .env avec la nouvelle URL" -ForegroundColor Magenta
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
