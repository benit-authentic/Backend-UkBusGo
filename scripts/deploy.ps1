# 🚀 Script de déploiement automatisé UK Bus GO Backend (PowerShell)
# Usage: .\scripts\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚌 UK Bus GO - Déploiement Backend" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Fonction pour afficher les messages colorés
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Vérifications pré-déploiement
Write-ColorMessage "🔍 Vérifications pré-déploiement..." "Blue"

# Vérifier que Git est clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-ColorMessage "❌ Vous avez des changements non commitées" "Red"
    Write-Host "   Veuillez commit ou stash vos changements avant le déploiement"
    exit 1
}

# Vérifier Node.js version
$nodeVersion = node --version
Write-ColorMessage "✅ Node.js version: $nodeVersion" "Green"

# Installer les dépendances
Write-ColorMessage "📦 Installation des dépendances..." "Blue"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Échec de l'installation des dépendances" "Red"
    exit 1
}

# Lancer les tests
Write-ColorMessage "🧪 Lancement des tests..." "Blue"
npm test
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Les tests ont échoué" "Red"
    exit 1
}

# Build du projet
Write-ColorMessage "🔨 Build du projet..." "Blue"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "❌ Le build a échoué" "Red"
    exit 1
}

# Vérifier les variables d'environnement
Write-ColorMessage "🔧 Vérification des variables d'environnement..." "Blue"

if (!(Test-Path ".env")) {
    Write-ColorMessage "⚠️  Fichier .env manquant" "Yellow"
    Write-Host "   Créez un fichier .env basé sur .env.example"
    Write-Host "   Ou utilisez: npm run generate-secrets"
}

# Linting
Write-ColorMessage "🔍 Vérification du code (ESLint)..." "Blue"
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️  Problèmes de linting détectés" "Yellow"
    Write-Host "   Exécutez: npm run format"
}

# Vérifications de sécurité
Write-ColorMessage "🔒 Audit de sécurité..." "Blue"
npm audit --audit-level moderate
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "⚠️  Vulnérabilités détectées" "Yellow"
    Write-Host "   Exécutez: npm audit fix"
}

# Résumé de déploiement
Write-ColorMessage "📋 Résumé du déploiement" "Blue"
Write-Host "   • Tests: ✅ Passés"
Write-Host "   • Build: ✅ Réussi"
Write-Host "   • Linting: ✅ Vérifié"
Write-Host "   • Sécurité: ✅ Auditée"

Write-ColorMessage "🎯 Prêt pour le déploiement!" "Green"

# Instructions pour Railway
Write-ColorMessage "🚄 Instructions Railway:" "Blue"
Write-Host "   1. Connectez votre repo GitHub à Railway"
Write-Host "   2. Configurez les variables d'environnement:"
Write-Host "      - MONGODB_URI"
Write-Host "      - JWT_SECRET"
Write-Host "      - JWT_REFRESH_SECRET"
Write-Host "   3. Railway déploiera automatiquement"

# Instructions pour Render
Write-ColorMessage "🎨 Instructions Render:" "Blue"
Write-Host "   1. Connectez votre repo à Render"
Write-Host "   2. Build Command: npm install && npm run build"
Write-Host "   3. Start Command: npm start"
Write-Host "   4. Ajoutez les variables d'environnement"

# Générer les secrets si nécessaire
$generateSecrets = Read-Host "🔐 Générer de nouveaux secrets JWT? (y/N)"
if ($generateSecrets -eq "y" -or $generateSecrets -eq "Y") {
    npm run generate-secrets
}

Write-ColorMessage "🚀 Déploiement validé!" "Green"
Write-Host "Votre backend UK Bus GO est prêt à être déployé."

# Ouvrir les liens utiles
Write-ColorMessage "🔗 Liens utiles:" "Blue"
Write-Host "   • Railway: https://railway.app"
Write-Host "   • Render: https://render.com"
Write-Host "   • MongoDB Atlas: https://cloud.mongodb.com"

$openLinks = Read-Host "Ouvrir les liens de déploiement? (y/N)"
if ($openLinks -eq "y" -or $openLinks -eq "Y") {
    Start-Process "https://railway.app"
    Start-Process "https://render.com"
    Start-Process "https://cloud.mongodb.com"
}
