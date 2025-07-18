# 🔍 Vérification Prêt au Déploiement - UK Bus GO Backend
# Usage: .\scripts\check-deployment-ready.ps1

$ErrorActionPreference = "Continue"

Write-Host "🚌 UK Bus GO - Vérification Prêt au Déploiement" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

$allGood = $true

# 1. Vérifier Node.js
Write-Host "`n🔍 Vérification Node.js..."
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 18) {
            Write-Success "Node.js $nodeVersion (compatible)"
        } else {
            Write-Error "Node.js $nodeVersion (version 18+ requise)"
            $allGood = $false
        }
    }
} catch {
    Write-Error "Node.js non installé"
    Write-Info "Installer depuis: https://nodejs.org"
    $allGood = $false
}

# 2. Vérifier npm
Write-Host "`n🔍 Vérification npm..."
try {
    $npmVersion = npm --version
    Write-Success "npm $npmVersion"
} catch {
    Write-Error "npm non disponible"
    $allGood = $false
}

# 3. Vérifier les fichiers essentiels
Write-Host "`n🔍 Vérification des fichiers..."

$requiredFiles = @(
    "package.json",
    "tsconfig.json", 
    "src/server.ts",
    "src/index.ts",
    ".env.example"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "$file"
    } else {
        Write-Error "$file manquant"
        $allGood = $false
    }
}

# 4. Vérifier package.json
Write-Host "`n🔍 Vérification package.json..."
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    
    if ($packageJson.scripts.build) {
        Write-Success "Script build défini"
    } else {
        Write-Error "Script build manquant"
        $allGood = $false
    }
    
    if ($packageJson.scripts.start) {
        Write-Success "Script start défini"
    } else {
        Write-Error "Script start manquant"
        $allGood = $false
    }
    
    if ($packageJson.main -eq "dist/server.js" -or $packageJson.main -eq "dist/index.js") {
        Write-Success "Point d'entrée correct: $($packageJson.main)"
    } else {
        Write-Warning "Point d'entrée: $($packageJson.main) (vérifiez que c'est correct)"
    }
}

# 5. Test de build
Write-Host "`n🔍 Test de build..."
try {
    npm install | Out-Null
    Write-Success "npm install réussi"
    
    npm run build | Out-Null
    Write-Success "npm run build réussi"
    
    if (Test-Path "dist") {
        Write-Success "Dossier dist créé"
    } else {
        Write-Error "Dossier dist non créé après build"
        $allGood = $false
    }
    
} catch {
    Write-Error "Échec du build"
    Write-Info "Vérifiez les erreurs avec: npm run build"
    $allGood = $false
}

# 6. Verifier les variables d'environnement
Write-Host "`n🔍 Verification variables d'environnement..."
if (Test-Path ".env") {
    Write-Success ".env existe"
    
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "JWT_SECRET=") {
        Write-Success "JWT_SECRET défini"
    } else {
        Write-Warning "JWT_SECRET manquant"
        Write-Info "Utilisez: npm run generate-secrets"
    }
    
    if ($envContent -match "MONGODB_URI=") {
        Write-Success "MONGODB_URI défini"
    } else {
        Write-Error "MONGODB_URI manquant"
        $allGood = $false
    }
    
} else {
    Write-Warning ".env manquant"
    Write-Info "Copiez .env.example vers .env et configurez"
}

# 7. Vérifier Git
Write-Host "`n🔍 Vérification Git..."
try {
    git status | Out-Null
    Write-Success "Repository Git initialisé"
    
    $remotes = git remote -v 2>$null
    if ($remotes) {
        Write-Success "Remote Git configuré"
    } else {
        Write-Warning "Aucun remote Git"
        Write-Info "Ajoutez votre repo GitHub: git remote add origin https://github.com/user/repo.git"
    }
    
} catch {
    Write-Error "Git non initialisé"
    Write-Info "Initialisez avec: git init"
    $allGood = $false
}

# 8. Vérifier Docker (optionnel)
Write-Host "`n🔍 Vérification Docker (optionnel)..."
try {
    docker --version | Out-Null
    Write-Success "Docker installé"
    
    try {
        docker compose version | Out-Null
        Write-Success "Docker Compose disponible"
    } catch {
        try {
            docker-compose --version | Out-Null
            Write-Success "Docker Compose (ancienne version) disponible"
        } catch {
            Write-Warning "Docker Compose non disponible"
        }
    }
} catch {
    Write-Warning "Docker non installé"
    Write-Info "Installation optionnelle: https://docker.com/products/docker-desktop"
}

# 9. Résumé final
Write-Host "`n📋 RÉSUMÉ" -ForegroundColor Yellow
Write-Host "=========" -ForegroundColor Yellow

if ($allGood) {
    Write-Host "`n🎉 PRÊT POUR LE DÉPLOIEMENT !" -ForegroundColor Green
    Write-Host "Votre backend UK Bus GO est prêt à être déployé.`n"
    
    Write-Host "🚀 Prochaines étapes recommandées:" -ForegroundColor Cyan
    Write-Host "1. Générer les secrets: npm run generate-secrets"
    Write-Host "2. Créer MongoDB Atlas: https://cloud.mongodb.com"
    Write-Host "3. Déployer sur Railway: https://railway.app"
    Write-Host "4. Configurer les variables d'environnement"
        Write-Host "5. Tester l'API deployee"
    
} else {
    Write-Host "`n❌ CORRECTIONS NÉCESSAIRES" -ForegroundColor Red
    Write-Host "Corrigez les erreurs ci-dessus avant le déploiement.`n"
    
    Write-Host "📚 Ressources utiles:" -ForegroundColor Cyan
    Write-Host "• Guide déploiement: ./DEPLOYMENT.md"
    Write-Host "• Installation Docker: ./DOCKER_INSTALL.md"
    Write-Host "• Démarrage rapide: ./QUICKSTART.md"
}

Write-Host "`n🔗 Liens utiles:"
Write-Host "• Railway: https://railway.app"
Write-Host "• MongoDB Atlas: https://cloud.mongodb.com"
Write-Host "• Node.js: https://nodejs.org"
Write-Host "• Support: https://github.com/votre-username/backuk/issues"
