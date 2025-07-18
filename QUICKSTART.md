# ⚡ UK Bus GO Backend - Démarrage Rapide

> **Mise en ligne de votre API en 15 minutes chrono !** ⏱️

## 🚀 Étapes Express

### 1️⃣ Préparer le Code (2 min)
```bash
# Générer les secrets sécurisés
npm run generate-secrets

# Vérifier que tout fonctionne
npm run deploy:check
```

### 2️⃣ MongoDB Atlas (5 min)
1. [Créer un compte](https://cloud.mongodb.com) ➜ **Try Free**
2. **Créer un cluster** ➜ M0 (gratuit)
3. **Database Access** ➜ Ajouter un utilisateur
4. **Network Access** ➜ Allow 0.0.0.0/0
5. **Copier la connection string** 📋

### 3️⃣ Déploiement Railway (5 min)
1. [Se connecter](https://railway.app) avec GitHub
2. **New Project** ➜ **Deploy from GitHub repo**
3. Sélectionner votre repo `backuk`
4. **Variables** ➜ Ajouter :
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bus-tickets
   JWT_SECRET=le_secret_généré_étape_1
   JWT_REFRESH_SECRET=le_refresh_secret_généré_étape_1
   NODE_ENV=production
   ```
5. **Settings** ➜ **Generate Domain**

### 4️⃣ Test (3 min)
```bash
# Health check
curl https://votre-url.railway.app/health

# Documentation
https://votre-url.railway.app/api/docs
```

## ✅ C'est Tout !

Votre API est en ligne ! 🎉

**URL de prod** : `https://votre-projet.railway.app`

---

## 🆘 Problèmes Courants

| Erreur | Solution |
|--------|----------|
| "MongoDB connection failed" | Vérifier la connection string + IP whitelist |
| "Application failed to start" | Vérifier les variables d'environnement |
| "502 Bad Gateway" | Redéployer : Railway > Deployments > Redeploy |

## 📞 Support

- 📖 [Guide détaillé](./DEPLOYMENT.md)
- 🐛 [Issues GitHub](../../issues)
- 🚄 [Railway Docs](https://docs.railway.app)

---

<div align="center">
  <strong>🚌 Happy Coding! 🚌</strong>
</div>
