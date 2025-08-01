@echo off
echo 🚀 Demarrage du serveur UkBus avec webhook FedaPay...
echo.

echo 📦 Demarrage du serveur sur le port 5000...
start npm start

echo.
echo 🌐 Maintenant, ouvrez un NOUVEAU terminal et tapez:
echo    ngrok http 5000
echo.
echo ✅ Ensuite suivez ces etapes :
echo.
echo 📋 Instructions :
echo 1. Dans le terminal ngrok, copiez l'URL HTTPS
echo 2. Votre URL webhook sera: https://VOTRE-URL.ngrok.io/api/fedapay/webhook
echo 3. Allez sur https://dashboard.fedapay.com
echo 4. Creez un webhook avec cette URL
echo.
echo 🔧 Mettez a jour votre fichier .env avec la nouvelle URL
echo.
pause
