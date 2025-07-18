# 🚀 Guide de Déploiement - UK Bus GO Backend

Ce guide vous accompagne pour déployer votre API Node.js/TypeScript gratuitement avec une base de données MongoDB Atlas.

## 🎯 Vue d'Ensemble

**Objectif** : Déployer l'API sur Railway + MongoDB Atlas (100% gratuit)
**Temps estimé** : 30-45 minutes
**Niveau** : Débutant/Intermédiaire

---

## 📋 Prérequis

- [ ] Compte GitHub (gratuit)
- [ ] Code source pushé sur GitHub
- [ ] Compte MongoDB Atlas (gratuit)
- [ ] Compte Railway (gratuit)

---

## 🗄️ Étape 1: Configuration MongoDB Atlas

### 1.1 Créer un Compte MongoDB Atlas

1. Aller sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Cliquer sur **"Try Free"**
3. S'inscrire avec Google/GitHub ou email
4. Compléter la vérification email

### 1.2 Créer un Cluster Gratuit

1. **Choisir le plan gratuit** : "M0 Sandbox" (512 MB)
2. **Provider** : AWS (recommandé)
3. **Région** : Choisir la plus proche (ex: `eu-west-1` pour l'Europe)
4. **Nom du cluster** : `uk-bus-cluster` ou laisser par défaut
5. Cliquer **"Create Cluster"** (création en 3-5 minutes)

### 1.3 Configurer l'Accès à la Base de Données

#### A. Créer un Utilisateur
1. Dans le panneau de gauche : **"Database Access"**
2. Cliquer **"Add New Database User"**
3. **Authentication Method** : "Password"
4. **Username** : `ukbus-api` (ou autre)
5. **Password** : Générer un mot de passe sécurisé (noter le !)
6. **Database User Privileges** : "Read and write to any database"
7. Cliquer **"Add User"**

#### B. Configurer l'Accès Réseau
1. Dans le panneau de gauche : **"Network Access"**
2. Cliquer **"Add IP Address"**
3. Cliquer **"Allow Access from Anywhere"** (0.0.0.0/0)
   > ⚠️ En production, restreindre aux IPs de Railway
4. Cliquer **"Confirm"**

### 1.4 Récupérer la Connection String

1. Retourner à **"Clusters"**
2. Cliquer **"Connect"** sur votre cluster
3. Choisir **"Connect your application"**
4. **Driver** : Node.js, **Version** : 4.1 or later
5. Copier la connection string, elle ressemble à :
   ```
   mongodb+srv://ukbus-api:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Remplacer `<password>` par le mot de passe de l'utilisateur
7. Ajouter le nom de la base de données à la fin :
   ```
   mongodb+srv://ukbus-api:motdepasse@cluster0.xxxxx.mongodb.net/bus-tickets?retryWrites=true&w=majority
   ```

---

## 🚄 Étape 2: Déploiement sur Railway

### 2.1 Préparer le Code sur GitHub

1. **Vérifier que votre code est sur GitHub** :
   ```bash
   cd backuk
   git add .
   git commit -m "feat: prepare for deployment"
   git push origin main
   ```

2. **Vérifier les fichiers essentiels** :
   - [ ] `package.json` avec `"start": "node dist/server.js"`
   - [ ] `.env.example` (template des variables)
   - [ ] `Dockerfile` (optionnel)

### 2.2 Créer un Compte Railway

1. Aller sur [Railway.app](https://railway.app)
2. Cliquer **"Login"**
3. Se connecter avec GitHub
4. Autoriser Railway à accéder à vos repos

### 2.3 Déployer le Projet

1. **Créer un nouveau projet** :
   - Cliquer **"New Project"**
   - Choisir **"Deploy from GitHub repo"**
   - Sélectionner votre repository `backuk`

2. **Railway détecte automatiquement** :
   - Language : Node.js
   - Build Command : `npm run build`
   - Start Command : `npm start`

3. **Le déploiement commence automatiquement** (5-10 minutes)

### 2.4 Configurer les Variables d'Environnement

1. **Dans Railway** :
   - Aller dans votre projet
   - Cliquer sur l'onglet **"Variables"**
   - Ajouter les variables suivantes :

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://ukbus-api:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/bus-tickets?retryWrites=true&w=majority
JWT_SECRET=votre_secret_jwt_super_securise_32_caracteres_minimum
JWT_REFRESH_SECRET=votre_secret_refresh_super_securise_32_caracteres_minimum
PAYGATE_API_KEY=votre_cle_paygate_si_disponible
CORS_ORIGIN=*
```

> 🔐 **Générer des secrets sécurisés** :
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 2.5 Obtenir l'URL de Production

1. **Dans Railway** :
   - Aller dans l'onglet **"Settings"**
   - Section **"Environment"**
   - Cliquer **"Generate Domain"**
   - Votre URL sera : `https://backuk-production-xxxx.up.railway.app`

2. **Tester l'API** :
   ```bash
   curl https://votre-url-railway.railway.app/health
   ```

---

## 🔧 Étape 3: Configuration Post-Déploiement

### 3.1 Tester les Endpoints Principaux

```bash
# Health Check
curl https://votre-url.railway.app/health

# API Documentation
https://votre-url.railway.app/api/docs

# Test d'inscription
curl -X POST https://votre-url.railway.app/api/students/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "phone": "12345678",
    "password": "password123"
  }'
```

### 3.2 Configurer le Frontend

Si vous avez un frontend Flutter, mettez à jour l'URL de l'API :

```dart
// config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://votre-url.railway.app/api';
}
```

### 3.3 Monitoring et Logs

1. **Logs Railway** :
   - Dans Railway > Onglet "Deployments"
   - Cliquer sur un déploiement pour voir les logs

2. **Monitoring MongoDB** :
   - Dans MongoDB Atlas > "Monitoring"
   - Visualiser les métriques de performance

---

## 🛠️ Étape 4: Alternatives de Déploiement

### Option B: Render.com

1. Connecter GitHub à [Render](https://render.com)
2. Créer un **Web Service**
3. Configuration :
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

### Option C: Vercel (Serverless)

```bash
npm install -g vercel
vercel --prod
```

### Option D: Heroku (Payant depuis 2022)

```bash
# Installer Heroku CLI
npm install -g heroku

# Login et création
heroku login
heroku create ukbus-api

# Variables d'environnement
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=...

# Déploiement
git push heroku main
```

---

## 🔒 Étape 5: Sécurité Production

### 5.1 Variables d'Environnement Sécurisées

```env
# ✅ Utilisez ces patterns
JWT_SECRET=f8d2a9c4e6b1a3f7d8e2c9b4a6f1d3e7f8a2c9b4e6d1a3f7d8e2c9b4a6f1d3e7
JWT_REFRESH_SECRET=a3f7d8e2c9b4a6f1d3e7f8a2c9b4e6d1a3f7d8e2c9b4a6f1d3e7f8a2c9b4e6d1

# ❌ N'utilisez jamais ça
JWT_SECRET=secret123
JWT_SECRET=password
```

### 5.2 CORS de Production

```env
# Autoriser seulement vos domaines
CORS_ORIGIN=https://yourapp.com,https://admin.yourapp.com

# Éviter en production
CORS_ORIGIN=*
```

### 5.3 Rate Limiting

Vérifiez que le rate limiting est actif :
```typescript
// Express rate limit déjà configuré
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requêtes par IP
}));
```

---

## 📊 Étape 6: Monitoring & Maintenance

### 6.1 Uptime Monitoring

1. **UptimeRobot** (gratuit) :
   - URL : [uptimerobot.com](https://uptimerobot.com)
   - Ajouter votre endpoint : `https://votre-url.railway.app/health`
   - Notifications par email en cas de problème

### 6.2 Logs Centralisés

```javascript
// winston.config.js - déjà configuré
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

### 6.3 Métriques MongoDB

Dans MongoDB Atlas :
1. **"Monitoring"** > **"Metrics"**
2. Surveiller :
   - Connexions actives
   - Opérations par seconde
   - Utilisation du stockage

---

## 🐛 Dépannage

### Problème 1: "Application failed to start"

**Solution** :
1. Vérifier les logs Railway
2. Vérifier que `npm start` fonctionne localement
3. Vérifier les variables d'environnement

### Problème 2: "MongoDB connection failed"

**Solutions** :
1. Vérifier la connection string
2. Vérifier l'utilisateur MongoDB
3. Vérifier l'accès réseau (0.0.0.0/0)

### Problème 3: "502 Bad Gateway"

**Solutions** :
1. Vérifier que l'app écoute sur `process.env.PORT`
2. Redéployer : Railway > "Deployments" > "Redeploy"

### Problème 4: "Environment variables not found"

**Solutions** :
1. Railway > "Variables" > Vérifier toutes les variables
2. Redémarrer le service

---

## ✅ Checklist Final

### Avant la Mise en Production
- [ ] MongoDB Atlas configuré et accessible
- [ ] Railway déployé avec succès
- [ ] Variables d'environnement configurées
- [ ] Health check répond `/health`
- [ ] API documentation accessible `/api/docs`
- [ ] Tests d'inscription/connexion fonctionnels
- [ ] CORS configuré pour votre frontend
- [ ] Monitoring activé (UptimeRobot)

### Après la Mise en Production
- [ ] URL partagée avec l'équipe frontend
- [ ] Documentation mise à jour avec l'URL production
- [ ] Tests de charge effectués
- [ ] Plan de sauvegarde MongoDB défini
- [ ] Procédure de rollback documentée

---

## 💰 Coûts Estimés

| Service | Plan | Prix | Limitations |
|---------|------|------|-------------|
| **Railway** | Starter | **Gratuit** | 500h/mois, 1GB RAM |
| **MongoDB Atlas** | M0 | **Gratuit** | 512MB, 1 base |
| **UptimeRobot** | Free | **Gratuit** | 50 monitors |
| **Total** | | **0€/mois** | |

> 💡 **Évolution payante** :
> - Railway Pro : $5/mois (plus de RAM/CPU)
> - MongoDB M2 : $9/mois (2GB)

---

## 🚀 Prochaines Étapes

1. **Custom Domain** : Configurer votre propre domaine
2. **SSL Certificate** : Automatic avec Railway
3. **CI/CD** : Auto-deploy sur push GitHub
4. **Staging Environment** : Environnement de test
5. **Database Backup** : Sauvegardes automatiques

---

## 📞 Support

- **Railway** : [help.railway.app](https://help.railway.app)
- **MongoDB Atlas** : [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **API Issues** : [GitHub Issues](https://github.com/votre-username/backuk/issues)

---

<div align="center">
  <strong>🎉 Félicitations ! Votre API est maintenant en ligne ! 🎉</strong><br>
  <em>Votre backend UK Bus GO est prêt à servir l'application mobile</em>
</div>
