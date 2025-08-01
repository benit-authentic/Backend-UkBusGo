# Script PowerShell pour démarrer le serveur avec webhook FedaPay

Write-Host "🚀 Démarrage du serveur UkBus avec webhook FedaPay..." -ForegroundColor Green
Write-Host ""

# Démarrer le serveur en arrière-plan
Write-Host "📦 Démarrage du serveur sur le port 5000..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"

# Attendre que le serveur démarre
Start-Sleep -Seconds 3

# Instructions pour ngrok
Write-Host ""
Write-Host "🌐 Maintenant, ouvrez un NOUVEAU terminal et tapez:" -ForegroundColor Cyan
Write-Host "   ngrok http 5000" -ForegroundColor White
Write-Host ""
Write-Host "✅ Ensuite suivez ces étapes :" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Instructions :" -ForegroundColor Yellow
Write-Host "1. Dans le terminal ngrok, copiez l'URL HTTPS (ex: https://abc123.ngrok.io)" -ForegroundColor White
Write-Host "2. Votre URL webhook sera: https://ABC123.ngrok.io/api/fedapay/webhook" -ForegroundColor White
Write-Host "3. Allez sur https://dashboard.fedapay.com" -ForegroundColor White
Write-Host "4. Créez un webhook avec cette URL" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Test rapide de votre webhook :" -ForegroundColor Magenta
Write-Host "   Remplacez l'URL dans le fichier .env :" -ForegroundColor White
Write-Host "   WEBHOOK_URL=https://ABC123.ngrok.io/api/fedapay/webhook" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
