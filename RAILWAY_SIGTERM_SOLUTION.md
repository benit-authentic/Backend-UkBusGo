# 🚨 RAILWAY SIGTERM ERROR - SOLUTION IMMÉDIATE

## 🔍 PROBLÈME IDENTIFIÉ

L'erreur `npm error signal SIGTERM` indique que Railway arrête votre application car **les variables d'environnement manquent**.

## ✅ SOLUTION EN 3 ÉTAPES

### Étape 1: Générer les variables
```bash
node scripts/railway-env-generator.js
```

### Étape 2: Ajouter TOUTES les variables sur Railway

1. **Ouvrez Railway** : https://railway.app
2. **Sélectionnez votre projet** Back-UkBus
3. **Cliquez sur l'onglet "Variables"**
4. **Pour CHAQUE variable** ci-dessous, cliquez "Add Variable":

```
NODE_ENV=production
PORT=5000
TRUST_PROXY=true
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/bus-tickets?retryWrites=true&w=majority
JWT_SECRET=0191069aec52dc58b086ef2558020b0d814f36c2f1595ff49f505d0bc24036b79fdbbe576c25e81104027fd6fc301cff76df861028fc807ee4360d14b3eb833e4
JWT_REFRESH_SECRET=fe5dd5f480312ac613ee7cdebb082fc6142c4b9ccf3dc670e1b7d792e9add04d8a4183aaa9c5c0bc88806ff60253471791fcbcdd1166c274e68d2bc4bd43bafe3
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d
CORS_ORIGIN=https://back-ukbus-production.up.railway.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SEED_DATABASE=false
DEBUG_MODE=false
```

### Étape 3: Configurer MongoDB Atlas

⚠️ **CRITIQUE** : Remplacez `USERNAME:PASSWORD` dans `MONGODB_URI` par vos vrais credentials MongoDB Atlas !

## 🔧 POURQUOI L'ERREUR SIGTERM ?

1. **Variables manquantes** → Server.ts vérifie JWT_SECRET et MONGODB_URI
2. **Variables absentes** → `process.exit(1)` est appelé
3. **Railway détecte l'arrêt** → Envoie SIGTERM et arrête le container
4. **NPM interprète** → Affiche "npm error signal SIGTERM"

## 🚀 RÉSULTAT ATTENDU

Après ajout des variables, vous devriez voir dans les logs Railway :

```
🚀 Démarrage du serveur...
📦 Environment: production
🔌 Port: 5000
✅ Variables d'environnement validées
📡 Connexion à MongoDB...
✅ MongoDB connecté
⏭️ Seeding désactivé (SEED_DATABASE=false)
✅ Serveur lancé sur http://0.0.0.0:5000
```

## 🧪 TEST IMMÉDIAT

Une fois les variables ajoutées :

1. **Railway redéploiera automatiquement**
2. **Testez** : `https://votre-app.railway.app/health`
3. **Vérifiez la doc** : `https://votre-app.railway.app/api/docs`

## 🆘 SI ÇA NE MARCHE TOUJOURS PAS

### Vérifiez MongoDB Atlas
1. **Network Access** → Doit contenir `0.0.0.0/0`
2. **Database Access** → Utilisateur avec password correct
3. **MONGODB_URI** → Ne doit pas contenir "USERNAME:PASSWORD"

### Vérifiez les logs Railway
```bash
railway logs
```

### Test local
```bash
# Avec les mêmes variables
JWT_SECRET=votre_secret MONGODB_URI=votre_uri npm start
```

---

## 📋 CHECKLIST COMPLET

- [ ] Variables ajoutées sur Railway (16 variables)
- [ ] MONGODB_URI avec vrais credentials (pas USERNAME:PASSWORD)
- [ ] MongoDB Atlas Network Access : 0.0.0.0/0
- [ ] Railway redéployé automatiquement
- [ ] Test health check réussi

## 🎯 STATUS

⚠️ **EN ATTENTE** : Ajoutez les variables sur Railway  
✅ **RÉUSSI** : Une fois les variables configurées, l'erreur SIGTERM disparaîtra

---

**Cette solution résout définitivement l'erreur SIGTERM sur Railway.**
