# 🐳 Script de Dépannage Docker - UK Bus GO Backend (PowerShell)
# Usage: .\scripts\docker-troubleshoot.ps1

$ErrorActionPreference = "Continue"

Write-Host "🐳 Dépannage Docker - UK Bus GO Backend" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

# Vérifier Docker
Write-Success "🔍 Vérification de Docker..."
try {
    $dockerVersion = docker --version
    Write-Success "✅ Docker version: $dockerVersion"
} catch {
    Write-Error "❌ Docker n'est pas installé ou n'est pas démarré"
    Write-Host "Installez Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
}

# Vérifier Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Success "✅ Docker Compose version: $composeVersion"
} catch {
    Write-Error "❌ Docker Compose n'est pas disponible"
    exit 1
}

# Nettoyer les containers existants
Write-Success "🧹 Nettoyage des containers existants..."
docker-compose down -v
docker system prune -f

# Solutions aux problèmes courants
Write-Warning "🔧 Solutions aux problèmes courants:"
Write-Host "1. npm install échoue:"
Write-Host "   -> cp Dockerfile.simple Dockerfile"
Write-Host ""
Write-Host "2. bcrypt ne compile pas:"
Write-Host "   -> Le Dockerfile inclut les dépendances système"
Write-Host ""
Write-Host "3. Mémoire insuffisante:"
Write-Host "   -> Docker Desktop > Settings > Resources > Memory > 4GB+"
Write-Host ""

# Demander quelle solution utiliser
$useSimple = Read-Host "Utiliser Dockerfile.simple? (y/N)"
if ($useSimple -eq "y" -or $useSimple -eq "Y") {
    Copy-Item "Dockerfile.simple" "Dockerfile" -Force
    Write-Success "✅ Dockerfile.simple copié vers Dockerfile"
}

# Rebuild avec cache disabled
Write-Success "🔨 Rebuild complet sans cache..."
docker-compose build --no-cache

# Test de construction
Write-Success "🧪 Test de construction..."
$buildResult = docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Success "✅ Construction réussie !"
    
    # Attendre que l'API démarre
    Write-Host "⏳ Attente du démarrage de l'API..."
    Start-Sleep -Seconds 30
    
    # Test health check
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 10
        Write-Success "✅ API accessible sur http://localhost:5000"
        Write-Success "📚 Documentation: http://localhost:5000/api/docs"
    } catch {
        Write-Error "❌ API non accessible"
        Write-Host "Logs de l'API:"
        docker-compose logs api
    }
    
    # Test MongoDB
    try {
        docker-compose exec mongo mongosh --eval "db.adminCommand('ping')" | Out-Null
        Write-Success "✅ MongoDB accessible"
    } catch {
        Write-Error "❌ MongoDB non accessible"
        Write-Host "Logs MongoDB:"
        docker-compose logs mongo
    }
    
} else {
    Write-Error "❌ Échec de la construction"
    Write-Host "Logs détaillés:"
    docker-compose logs
    
    Write-Host ""
    Write-Warning "🔧 Solutions suggérées:"
    Write-Host "1. Utiliser Dockerfile.simple: Copy-Item Dockerfile.simple Dockerfile"
    Write-Host "2. Vérifier la mémoire Docker (4GB minimum)"
    Write-Host "3. Nettoyer Docker: docker system prune -a"
    Write-Host "4. Vérifier le fichier .env"
}

# Ouvrir les URLs
$openUrls = Read-Host "Ouvrir l'API dans le navigateur? (y/N)"
if ($openUrls -eq "y" -or $openUrls -eq "Y") {
    Start-Process "http://localhost:5000/health"
    Start-Process "http://localhost:5000/api/docs"
}

Write-Success "🏁 Dépannage terminé"
