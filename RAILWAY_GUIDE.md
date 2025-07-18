# 🚄 Guide Railway - UK Bus GO Backend

## 🎯 Problème Résolu : Trust Proxy

L'erreur que vous avez rencontrée est maintenant **corrigée** :

```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

### ✅ **Solution Implémentée**

1. **Trust Proxy activé** automatiquement en production
2. **Rate limiting adapté** pour les proxies Railway
3. **IP normalization** pour tous les cas d'usage
4. **Debug middleware** pour diagnostiquer les problèmes

## 🚀 **Déploiement Railway Express**

### 1. Préparer le Code
```bash
# Vérifier que les corrections sont appliquées
npm run build

# Commit et push
git add .
git commit -m "fix: configure trust proxy for Railway deployment"
git push origin main
```

### 2. Variables d'Environnement Railway

Dans Railway, ajouter ces variables :

```env
# Production essentielles
NODE_ENV=production
PORT=5000
TRUST_PROXY=true

# Base de données (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bus-tickets?retryWrites=true&w=majority

# Secrets JWT (utiliser npm run generate-secrets)
JWT_SECRET=49c09875558ff2669716f48654a9de6a090fe7793de58d75be638b0893195c33
JWT_REFRESH_SECRET=b617523472021b8f71099615833f9a7fe70df64d7c1b97cfb739fa3a9271ed14

# PayGate (optionnel pour l'instant)
PAYGATE_WEBHOOK_SECRET=ba49ba3c811724b9c56e6bf5a629c8ba
PAYGATE_API_KEY=your_paygate_api_key_when_available

# CORS (autoriser vos domaines)
CORS_ORIGIN=*

# Debug (si nécessaire)
DEBUG=false
```

### 3. Comptes de Test Disponibles

Votre seeder a créé ces comptes :

```
👑 Admin:
   - Phone: 90000000
   - Password: admin123

🚗 Chauffeurs:
   - Phone: 91111111, Password: driver1
   - Phone: 92222222, Password: driver2

🎓 Étudiants:
   - Phone: 93333333, Password: student33 (balance: 10,000F)
   - Phone: 94444444, Password: student44 (balance: 0F)
```

### 4. Test de l'API Déployée

```bash
# Health check
curl https://votre-url.railway.app/health

# Documentation Swagger
https://votre-url.railway.app/api/docs

# Test connexion admin
curl -X POST https://votre-url.railway.app/api/admins/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "90000000",
    "password": "admin123"
  }'

# Test connexion étudiant
curl -X POST https://votre-url.railway.app/api/students/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "93333333",
    "password": "student33"
  }'
```

## 🔧 **Fonctionnalités Proxy Corrigées**

### Rate Limiting Intelligent
- ✅ **Détection IP correcte** via X-Forwarded-For
- ✅ **100 requêtes/15min** par IP réelle
- ✅ **Health checks exemptés** du rate limiting
- ✅ **Messages d'erreur** en français

### Trust Proxy Automatique
- ✅ **Activation automatique** en production
- ✅ **Compatible Railway/Render/Heroku**
- ✅ **Debug mode** disponible si nécessaire

### IP Normalization
- ✅ **X-Forwarded-For** (Railway standard)
- ✅ **X-Real-IP** (Render)
- ✅ **CF-Connecting-IP** (Cloudflare)
- ✅ **Fallback robuste** pour tous cas

## 📊 **Monitoring Railway**

### Logs Application
```bash
# Dans Railway > Deployments > Logs
# Rechercher ces messages :
🔧 Trust proxy activé pour la production
MongoDB connecté
Serveur lancé sur http://localhost:8080
```

### Métriques Importantes
- **CPU Usage** : < 50% normal
- **Memory** : < 500MB pour démarrage
- **Response Time** : < 200ms santé
- **Error Rate** : < 1%

## 🐛 **Dépannage Railway**

### Problème 1: App Crash au Démarrage
```bash
# Solution: Vérifier les variables d'environnement
# Surtout MONGODB_URI et JWT_SECRET
```

### Problème 2: 502 Bad Gateway
```bash
# Solution: Vérifier que l'app écoute sur process.env.PORT
# Railway assign un port dynamique
```

### Problème 3: Rate Limiting Errors
```bash
# Solution: Vérifier TRUST_PROXY=true dans Railway
# Redéployer si nécessaire
```

### Problème 4: MongoDB Connection Failed
```bash
# Solution:
# 1. Vérifier MONGODB_URI
# 2. MongoDB Atlas > Network Access > 0.0.0.0/0
# 3. Database Access > User avec permissions
```

## 🎉 **Résultat Attendu**

Votre API sera accessible sur :
- **URL** : `https://backuk-production-xxxx.up.railway.app`
- **Health** : `/health` (status: OK)
- **Docs** : `/api/docs` (Swagger UI)
- **Admin** : Test avec compte 90000000/admin123

## 📞 **Support Railway**

- **Dashboard** : [railway.app/dashboard](https://railway.app/dashboard)
- **Docs** : [docs.railway.app](https://docs.railway.app)
- **Discord** : [railway.app/discord](https://railway.app/discord)

---

<div align="center">
  <strong>🚄 Votre backend UK Bus GO est prêt pour Railway ! 🚄</strong><br>
  <em>Trust proxy configuré, rate limiting corrigé, prêt en production</em>
</div>
