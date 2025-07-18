#!/bin/bash

# 🚀 Script de déploiement automatisé UK Bus GO Backend
# Usage: ./scripts/deploy.sh

set -e

echo "🚌 UK Bus GO - Déploiement Backend"
echo "=================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_message() {
    echo -e "${2}$1${NC}"
}

# Vérifications pré-déploiement
print_message "🔍 Vérifications pré-déploiement..." $BLUE

# Vérifier que Git est clean
if ! git diff-index --quiet HEAD --; then
    print_message "❌ Vous avez des changements non commitées" $RED
    echo "   Veuillez commit ou stash vos changements avant le déploiement"
    exit 1
fi

# Vérifier Node.js version
NODE_VERSION=$(node --version)
print_message "✅ Node.js version: $NODE_VERSION" $GREEN

# Installer les dépendances
print_message "📦 Installation des dépendances..." $BLUE
npm install

# Lancer les tests
print_message "🧪 Lancement des tests..." $BLUE
npm test
if [ $? -ne 0 ]; then
    print_message "❌ Les tests ont échoué" $RED
    exit 1
fi

# Build du projet
print_message "🔨 Build du projet..." $BLUE
npm run build
if [ $? -ne 0 ]; then
    print_message "❌ Le build a échoué" $RED
    exit 1
fi

# Vérifier les variables d'environnement
print_message "🔧 Vérification des variables d'environnement..." $BLUE

if [ ! -f ".env" ]; then
    print_message "⚠️  Fichier .env manquant" $YELLOW
    echo "   Créez un fichier .env basé sur .env.example"
    echo "   Ou utilisez: npm run generate-secrets"
fi

# Linting
print_message "🔍 Vérification du code (ESLint)..." $BLUE
npm run lint
if [ $? -ne 0 ]; then
    print_message "⚠️  Problèmes de linting détectés" $YELLOW
    echo "   Exécutez: npm run format"
fi

# Vérifications de sécurité
print_message "🔒 Audit de sécurité..." $BLUE
npm audit --audit-level moderate
if [ $? -ne 0 ]; then
    print_message "⚠️  Vulnérabilités détectées" $YELLOW
    echo "   Exécutez: npm audit fix"
fi

# Résumé de déploiement
print_message "📋 Résumé du déploiement" $BLUE
echo "   • Tests: ✅ Passés"
echo "   • Build: ✅ Réussi"
echo "   • Linting: ✅ Vérifié"
echo "   • Sécurité: ✅ Auditée"

print_message "🎯 Prêt pour le déploiement!" $GREEN

# Instructions pour Railway
print_message "🚄 Instructions Railway:" $BLUE
echo "   1. Connectez votre repo GitHub à Railway"
echo "   2. Configurez les variables d'environnement:"
echo "      - MONGODB_URI"
echo "      - JWT_SECRET"
echo "      - JWT_REFRESH_SECRET"
echo "   3. Railway déploiera automatiquement"

# Instructions pour Render
print_message "🎨 Instructions Render:" $BLUE
echo "   1. Connectez votre repo à Render"
echo "   2. Build Command: npm install && npm run build"
echo "   3. Start Command: npm start"
echo "   4. Ajoutez les variables d'environnement"

# Générer les secrets si nécessaire
read -p "🔐 Générer de nouveaux secrets JWT? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run generate-secrets
fi

print_message "🚀 Déploiement validé!" $GREEN
echo "Votre backend UK Bus GO est prêt à être déployé."
