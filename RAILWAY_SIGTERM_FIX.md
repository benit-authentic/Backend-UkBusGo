# 🚨 Résolution Erreur Railway SIGTERM

## Problème rencontré
```
npm error command failed
npm error signal SIGTERM
npm error command sh -c node dist/server.js
```

## ✅ Solutions implémentées

### 1. Server.ts amélioré
- Validation des variables d'environnement au démarrage
- Gestion gracieuse des signaux SIGTERM/SIGINT
- Logs détaillés pour le debugging
- Binding sur `0.0.0.0` (nécessaire pour Railway)

### 2. Variables d'environnement générées
Un script automatique génère tous les secrets nécessaires :
```bash
node scripts/generate-production-env.js
```

### 3. Configuration Railway complète
- Trust proxy activé (`TRUST_PROXY=true`)
- Rate limiting compatible avec les proxies
- Health checks configurés

## 🔧 Étapes de résolution

### Étape 1: Configurer MongoDB Atlas
1. Créez un cluster gratuit sur https://cloud.mongodb.com
2. Ajoutez `0.0.0.0/0` dans Network Access
3. Récupérez la chaîne de connexion

### Étape 2: Configurer Railway
1. Connectez votre repo GitHub à Railway
2. Ajoutez toutes les variables d'environnement générées
3. **IMPORTANT** : Remplacez `MONGODB_URI` par votre vraie connexion Atlas

### Étape 3: Variables critiques
```bash
NODE_ENV=production
PORT=5000
TRUST_PROXY=true
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bus-tickets
JWT_SECRET=votre_secret_genere
JWT_REFRESH_SECRET=votre_secret_refresh_genere
SEED_DATABASE=false
```

### Étape 4: Test du déploiement
1. Railway build automatiquement avec le Dockerfile
2. Test health check : `https://votre-app.railway.app/health`
3. Test API docs : `https://votre-app.railway.app/api/docs`

## 🎯 Points clés pour Railway

### Trust Proxy
✅ **Résolu** - Configuration ajoutée dans `src/index.ts`:
```typescript
app.set('trust proxy', 1);
```

### Graceful Shutdown
✅ **Résolu** - Gestion des signaux dans `src/server.ts`:
```typescript
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
```

### Variables d'environnement
✅ **Résolu** - Validation au démarrage:
```typescript
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET manquant');
  process.exit(1);
}
```

## 🧪 Test en local

Pour vérifier avant déploiement :
```bash
npm run build
JWT_SECRET=test123 MONGODB_URI=mongodb://localhost:27017/test npm start
```

## 📋 Checklist de déploiement

- [x] MongoDB Atlas configuré avec accès réseau `0.0.0.0/0`
- [x] Variables d'environnement générées et ajoutées à Railway
- [x] MONGODB_URI remplacé par la vraie connexion Atlas
- [x] Trust proxy activé
- [x] Rate limiting configuré pour les proxies
- [x] Health checks implémentés
- [x] Graceful shutdown configuré

## 🚀 Résultat

Après ces modifications, l'application devrait démarrer correctement sur Railway sans erreur SIGTERM.

Le problème principal était l'absence de variables d'environnement obligatoires (JWT_SECRET, MONGODB_URI) et la configuration proxy manquante pour Railway.
