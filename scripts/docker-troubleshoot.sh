#!/bin/bash

# 🐳 Script de Dépannage Docker - UK Bus GO Backend
# Usage: ./scripts/docker-troubleshoot.sh

echo "🐳 Dépannage Docker - UK Bus GO Backend"
echo "======================================"

# Fonction pour afficher les messages colorés
print_message() {
    echo -e "\033[0;32m$1\033[0m"
}

print_error() {
    echo -e "\033[0;31m$1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m$1\033[0m"
}

# Vérifier Docker
print_message "🔍 Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    print_error "❌ Docker n'est pas installé"
    exit 1
fi

docker_version=$(docker --version)
print_message "✅ Docker version: $docker_version"

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "❌ Docker Compose n'est pas installé"
    exit 1
fi

compose_version=$(docker-compose --version)
print_message "✅ Docker Compose version: $compose_version"

# Nettoyer les containers existants
print_message "🧹 Nettoyage des containers existants..."
docker-compose down -v
docker system prune -f

# Problème 1: npm install échoue
print_warning "🔧 Solution 1: Utiliser Dockerfile simple"
echo "Si npm install échoue, copiez Dockerfile.simple vers Dockerfile:"
echo "cp Dockerfile.simple Dockerfile"

# Problème 2: bcrypt ne compile pas
print_warning "🔧 Solution 2: Problème bcrypt"
echo "Le Dockerfile inclut python3, make, g++ pour compiler bcrypt"

# Problème 3: Mémoire insuffisante
print_warning "🔧 Solution 3: Augmenter la mémoire Docker"
echo "Dans Docker Desktop: Settings > Resources > Memory > 4GB+"

# Rebuild avec cache disabled
print_message "🔨 Rebuild complet sans cache..."
docker-compose build --no-cache

# Test de construction
print_message "🧪 Test de construction..."
if docker-compose up -d; then
    print_message "✅ Construction réussie !"
    
    # Attendre que l'API démarre
    echo "⏳ Attente du démarrage de l'API..."
    sleep 30
    
    # Test health check
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_message "✅ API accessible sur http://localhost:5000"
        print_message "📚 Documentation: http://localhost:5000/api/docs"
    else
        print_error "❌ API non accessible"
        echo "Logs de l'API:"
        docker-compose logs api
    fi
    
    # Test MongoDB
    if docker-compose exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_message "✅ MongoDB accessible"
    else
        print_error "❌ MongoDB non accessible"
        echo "Logs MongoDB:"
        docker-compose logs mongo
    fi
    
else
    print_error "❌ Échec de la construction"
    echo "Logs détaillés:"
    docker-compose logs
    
    echo ""
    print_warning "🔧 Solutions suggérées:"
    echo "1. Utiliser Dockerfile.simple: cp Dockerfile.simple Dockerfile"
    echo "2. Vérifier la mémoire Docker (4GB minimum)"
    echo "3. Nettoyer Docker: docker system prune -a"
    echo "4. Vérifier le fichier .env"
fi

print_message "🏁 Dépannage terminé"
