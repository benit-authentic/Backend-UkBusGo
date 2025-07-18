# 🚂 Railway Deployment Guide - UK Bus GO Backend

Ce guide vous accompagne étape par étape pour déployer le backend sur Railway avec MongoDB Atlas.

## 🎯 Prérequis

- [x] Compte Railway (gratuit) : https://railway.app
- [x] Compte MongoDB Atlas (gratuit) : https://cloud.mongodb.com
- [x] Code backend fonctionnel localement
- [x] Git repository sur GitHub

## 📋 Étape 1: Préparer MongoDB Atlas

### 1.1 Créer un cluster MongoDB Atlas

1. Allez sur https://cloud.mongodb.com
2. Créez un compte gratuit ou connectez-vous
3. Créez un nouveau cluster (M0 Sandbox - GRATUIT)
4. Choisissez une région proche (Europe)
5. Nommez votre cluster (ex: `bus-tickets-cluster`)

### 1.2 Configurer l'accès réseau

1. Dans Database Access → Add New Database User
2. Créez un utilisateur avec un mot de passe fort
3. Dans Network Access → Add IP Address
4. Ajoutez `0.0.0.0/0` (accès depuis partout - nécessaire pour Railway)

### 1.3 Récupérer la chaîne de connexion

1. Allez dans Clusters → Connect
2. Choisissez "Connect your application"
3. Copiez la chaîne de connexion MongoDB :
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-tickets?retryWrites=true&w=majority
```

## 🚂 Étape 2: Déployer sur Railway

### 2.1 Préparer l'environnement

Générez les variables d'environnement :

```bash
node scripts/generate-production-env.js
```

### 2.2 Connecter votre repository

1. Allez sur https://railway.app
2. Créez un compte avec GitHub
3. Cliquez sur "New Project"
4. Sélectionnez "Deploy from GitHub repo"
5. Choisissez votre repository `Back-UkBus`

### 2.3 Configurer les variables d'environnement

Dans votre projet Railway, allez dans l'onglet **Variables** et ajoutez :

#### Variables obligatoires :
```bash
NODE_ENV=production
PORT=5000
TRUST_PROXY=true

# MongoDB Atlas (remplacez par votre vraie connexion)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bus-tickets?retryWrites=true&w=majority

# JWT Secrets (utilisez ceux générés par le script)
JWT_SECRET=votre_secret_jwt_genere
JWT_REFRESH_SECRET=votre_secret_refresh_genere
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d

# CORS (remplacez par votre domaine Railway)
CORS_ORIGIN=https://back-ukbus-production.up.railway.app

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Production settings
SEED_DATABASE=false
DEBUG_MODE=false
```

#### Variables optionnelles (PayGate) :
```bash
PAYGATE_API_KEY=your_paygate_api_key_here
PAYGATE_BASE_URL=https://sandbox.paygate.tg
PAYGATE_WEBHOOK_SECRET=votre_webhook_secret_genere
```

### 2.4 Déploiement automatique

Railway détecte automatiquement votre `Dockerfile` et :
1. Build l'image Docker
2. Déploie l'application
3. Fournit une URL publique

## 🧪 Étape 3: Tester le déploiement

### 3.1 Vérifier le health check

```bash
curl https://votre-app.railway.app/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "timestamp": "2025-07-18T14:00:00.000Z",
  "database": { "status": "connected" }
}
```

### 3.2 Tester la documentation

Visitez : `https://votre-app.railway.app/api/docs`

### 3.3 Tester l'authentification

```bash
curl -X POST https://votre-app.railway.app/api/students/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "90000001",
    "password": "student123"
  }'
```

## 🔧 Étape 4: Résolution des problèmes

### 4.1 Erreurs de démarrage

Si l'application ne démarre pas :

1. Vérifiez les logs dans Railway
2. Assurez-vous que toutes les variables d'environnement sont définies
3. Vérifiez la connexion MongoDB Atlas

### 4.2 Erreurs de proxy

Si vous voyez des erreurs liées à `trust proxy` :

✅ **RÉSOLU** - Le code inclut déjà :
```typescript
app.set('trust proxy', 1);
```

### 4.3 Erreurs de connexion MongoDB

- Vérifiez que l'IP `0.0.0.0/0` est autorisée dans Network Access
- Vérifiez les credentials dans la chaîne de connexion
- Assurez-vous que le nom de la base `bus-tickets` est correct

### 4.4 Erreurs CORS

Mettez à jour `CORS_ORIGIN` avec votre vraie URL Railway :
```bash
CORS_ORIGIN=https://votre-app.railway.app
```

## 📊 Étape 5: Monitoring

### 5.1 Logs en temps réel

```bash
railway logs
```

### 5.2 Métriques Railway

- CPU/Memory usage dans l'onglet Metrics
- Request logs dans l'onglet Observability

### 5.3 Health checks

Railway fait automatiquement des health checks sur `/health`

## 🚀 Étape 6: Domaine personnalisé (optionnel)

1. Dans Railway → Settings → Domains
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions
4. Mettez à jour `CORS_ORIGIN`

## 🔒 Sécurité en production

- [x] JWT secrets générés aléatoirement
- [x] Trust proxy activé
- [x] Rate limiting configuré
- [x] CORS configuré
- [x] Variables sensibles dans Railway Variables
- [x] MongoDB Atlas avec authentification

## 💰 Coûts

- **Railway** : $5/mois après 500h d'usage gratuit
- **MongoDB Atlas** : Gratuit jusqu'à 512MB

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs Railway
2. Testez localement avec les mêmes variables d'environnement
3. Consultez la documentation Railway : https://docs.railway.app

## 📝 Résumé des URL importantes

- **Application** : https://votre-app.railway.app
- **Documentation API** : https://votre-app.railway.app/api/docs
- **Health check** : https://votre-app.railway.app/health
- **Railway Dashboard** : https://railway.app/dashboard

---

✅ **Déploiement réussi !** Votre API est maintenant accessible publiquement.
