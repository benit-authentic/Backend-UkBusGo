# Check Deployment Ready - UK Bus GO Backend
# Usage: .\scripts\check-deployment-ready.ps1

$ErrorActionPreference = "Continue"

Write-Host "UK Bus GO - Verification Pret au Deploiement" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

function Write-Success {
    param([string]$Message)
    Write-Host "OK $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "ERROR $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "WARNING $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "INFO $Message" -ForegroundColor Blue
}

$allGood = $true

# 1. Verifier Node.js
Write-Host "`nVerification Node.js..."
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
    Write-Error "Node.js non installe"
    $allGood = $false
}

# 2. Test build
Write-Host "`nTest de build..."
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build reussi"
    } else {
        Write-Error "Build echoue"
        $allGood = $false
    }
} catch {
    Write-Error "Erreur de build"
    $allGood = $false
}

# 3. Verifier fichiers
Write-Host "`nVerification fichiers..."
$files = @("package.json", "tsconfig.json", "src/server.ts")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Success "$file"
    } else {
        Write-Error "$file manquant"
        $allGood = $false
    }
}

# 4. Resultat final
Write-Host "`nRESULTAT FINAL" -ForegroundColor Yellow
if ($allGood) {
    Write-Host "PRET POUR LE DEPLOIEMENT!" -ForegroundColor Green
    Write-Host "Prochaines etapes:"
    Write-Host "1. npm run generate-secrets"
    Write-Host "2. Creer MongoDB Atlas"
    Write-Host "3. Deployer sur Railway"
} else {
    Write-Host "CORRECTIONS NECESSAIRES" -ForegroundColor Red
    Write-Host "Corrigez les erreurs ci-dessus"
}

Write-Host "`nLiens utiles:"
Write-Host "Railway: https://railway.app"
Write-Host "MongoDB Atlas: https://cloud.mongodb.com"
