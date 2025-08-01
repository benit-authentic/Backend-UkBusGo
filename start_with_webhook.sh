#!/bin/bash

echo "🚀 Démarrage du serveur UkBus avec webhook FedaPay..."
echo ""

# Démarrer le serveur en arrière-plan
echo "📦 Démarrage du serveur sur le port 5000..."
npm start &
SERVER_PID=$!

# Attendre que le serveur démarre
sleep 3

# Démarrer ngrok pour exposer le webhook
echo "🌐 Exposition du webhook via ngrok..."
ngrok http 5000 &
NGROK_PID=$!

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Instructions :"
echo "1. Ouvrez l'URL ngrok qui s'affiche (ex: https://abc123.ngrok.io)"
echo "2. Votre URL webhook sera: https://ABC123.ngrok.io/api/fedapay/webhook"
echo "3. Copiez cette URL et allez sur le dashboard FedaPay"
echo ""
echo "🛑 Pour arrêter :"
echo "   Ctrl+C puis: kill $SERVER_PID $NGROK_PID"

# Attendre l'interruption
wait
