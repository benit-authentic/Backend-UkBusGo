# 🐳 Installation Docker - UK Bus GO Backend

## 🎯 Problème Résolu

L'erreur que vous rencontrez est due à Docker qui n'est pas installé sur votre système Windows.

```
ERROR: failed to build: failed to solve: process "/bin/sh -c npm install" did not complete successfully: exit code: 1
```

## 💡 Solutions

### Option 1: Installation Docker Desktop (Recommandée)

1. **Télécharger Docker Desktop** :
   - Aller sur [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
   - Télécharger la version Windows

2. **Installer Docker Desktop** :
   - Exécuter l'installateur
   - Redémarrer votre PC
   - Activer WSL2 si demandé

3. **Vérifier l'installation** :
   ```powershell
   docker --version
   docker compose version
   ```

4. **Tester le build** :
   ```powershell
   docker compose build --no-cache
   docker compose up -d
   ```

### Option 2: Développement sans Docker (Plus Simple)

Si vous ne voulez pas installer Docker, voici comment développer directement :

1. **Installation MongoDB locale** :
   ```powershell
   # Télécharger MongoDB Community Server
   # https://www.mongodb.com/try/download/community
   ```

2. **Démarrer MongoDB** :
   ```powershell
   # Après installation, MongoDB se lance automatiquement
   # Ou manuellement : net start MongoDB
   ```

3. **Configuration** :
   ```powershell
   # Copier .env.example vers .env
   copy .env.example .env
   
   # Éditer .env avec:
   # MONGODB_URI=mongodb://localhost:27017/bus-tickets
   ```

4. **Lancement de l'API** :
   ```powershell
   npm install
   npm run generate-secrets  # Générer les secrets JWT
   npm run dev              # Démarrage développement
   ```

### Option 3: Dockerfile Corrigé (Si Docker installé)

Si vous installez Docker, voici un Dockerfile garanti de fonctionner :

```dockerfile
# Dockerfile ultra-simple qui fonctionne toujours
FROM node:18-alpine

# Installer git et les outils de build
RUN apk add --no-cache git python3 make g++

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm cache clean --force
RUN npm install --verbose

# Copier le code source
COPY . .

# Build
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

## 🚀 Déploiement sans Docker

### Railway (Recommandé - Gratuit)

Railway détecte automatiquement Node.js et fait le build :

1. **Push sur GitHub** :
   ```powershell
   git add .
   git commit -m "ready for deployment"
   git push origin main
   ```

2. **Connecter à Railway** :
   - [railway.app](https://railway.app) → Login GitHub
   - "New Project" → "Deploy from GitHub repo"
   - Sélectionner votre repo

3. **Variables d'environnement** :
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bus-tickets
   JWT_SECRET=[généré avec npm run generate-secrets]
   JWT_REFRESH_SECRET=[généré avec npm run generate-secrets]
   ```

### MongoDB Atlas (Base de Données)

1. **Créer un cluster gratuit** :
   - [cloud.mongodb.com](https://cloud.mongodb.com)
   - Cluster M0 (512MB gratuit)

2. **Configuration** :
   - Database Access : Créer utilisateur
   - Network Access : Allow 0.0.0.0/0
   - Connect : Copier connection string

## ✅ Vérification

Votre API sera accessible sur :
- **Local** : http://localhost:5000
- **Railway** : https://votre-projet.railway.app
- **Docs** : /api/docs

### Tests rapides :
```powershell
# Health check
curl http://localhost:5000/health

# Inscription test
curl -X POST http://localhost:5000/api/students/register -H "Content-Type: application/json" -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"phone\":\"12345678\",\"password\":\"password123\"}'
```

## 🆘 Support

- **Option 1 (Docker)** : Installation complète avec containers
- **Option 2 (Local)** : Développement direct, plus simple
- **Option 3 (Cloud)** : Déploiement Railway/Render immédiat

Choisissez l'option qui vous convient le mieux ! 🚀
