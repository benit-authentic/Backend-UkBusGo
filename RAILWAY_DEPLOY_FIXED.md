# 🚂 Déploiement Railway - Guide Complet avec Fix Trust Proxy

## ✅ Problème résolu : ERR_ERL_UNEXPECTED_X_FORWARDED_FOR

L'erreur Railway `ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false` est maintenant **RÉSOLUE**.

## 🚀 Déploiement en 3 étapes

### Étape 1: Créer le projet Railway

1. Allez sur https://railway.app
2. Connectez-vous avec GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Sélectionnez votre repository `Back-UkBus`

### Étape 2: Configurer MongoDB Atlas

1. Créez un cluster gratuit sur https://cloud.mongodb.com
2. **Network Access** → Ajoutez `0.0.0.0/0`
3. **Database Access** → Créez un utilisateur
4. **Connect** → Copiez la chaîne de connexion

### Étape 3: Variables d'environnement Railway

Dans votre projet Railway, onglet **Variables**, ajoutez :

```bash
# ⚠️ VARIABLES OBLIGATOIRES
NODE_ENV=production
PORT=5000
TRUST_PROXY=true

# MongoDB Atlas - REMPLACEZ par votre vraie connexion
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bus-tickets?retryWrites=true&w=majority

# JWT Secrets - Utilisez ceux générés par le script
JWT_SECRET=e84378f35f5006e8a3a68b09452771b2c9a482958cc07cecac4f01e86f986b3322b99d2bfb457066879e695337b9f3ae1514976c1bcec2ef447c3c4d19e1307511
JWT_REFRESH_SECRET=de88a20c7121e9017029c036b1408804b4d079ac390f4e9f09c191466a7cd14b726ea2cc201c84f708f5f1375bd140f739368b7fc189fb6dec8031cc25e502ced

JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=365d

# CORS - Sera généré automatiquement par Railway
CORS_ORIGIN=https://back-ukbus-production.up.railway.app

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Production settings
SEED_DATABASE=false
DEBUG_MODE=false

# PayGate (optionnel)
PAYGATE_API_KEY=your_paygate_api_key_here
PAYGATE_BASE_URL=https://sandbox.paygate.tg
PAYGATE_WEBHOOK_SECRET=c1ca91ab075173c9e01b6aae8804f756fb7c2604db48d53deb0fe4c9e9a14cf1
```

## 🔧 Configuration technique appliquée

### Trust Proxy Fix
```typescript
// src/index.ts - Configuration automatique
app.set('trust proxy', true); // AVANT rate limiting
```

### Rate Limiting Compatible
```typescript
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip || 'unknown' // Utilise X-Forwarded-For
};
```

## 🧪 Tests après déploiement

### 1. Health Check
```bash
curl https://votre-app.railway.app/health
```
**Réponse attendue :**
```json
{
  "status": "OK",
  "timestamp": "2025-07-18T14:00:00.000Z",
  "database": { "status": "connected" }
}
```

### 2. Documentation API
Visitez : `https://votre-app.railway.app/api/docs`

### 3. Test Login
```bash
curl -X POST https://votre-app.railway.app/api/students/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "90000001", "password": "student123"}'
```

## 📊 Monitoring Railway

### Logs en temps réel
```bash
railway logs
```

### Signaux de démarrage réussi
```
🔧 Trust proxy activé (requis pour Railway/Render)
✅ MongoDB connecté
✅ Serveur lancé sur http://0.0.0.0:5000
```

## ⚠️ Points d'attention

### Variables critiques
- `TRUST_PROXY=true` : **OBLIGATOIRE** pour Railway
- `MONGODB_URI` : Remplacez par votre vraie connexion Atlas
- `JWT_SECRET` : Utilisez les secrets générés (minimum 32 caractères)

### Erreurs courantes évitées
- ✅ Trust proxy configuré avant rate limiting
- ✅ Headers X-Forwarded-For gérés correctement
- ✅ IP client détectée correctement
- ✅ Rate limiting fonctionne avec les proxies

## 💰 Coûts

- **Railway** : Gratuit jusqu'à 500h/mois, puis $5/mois
- **MongoDB Atlas** : Gratuit jusqu'à 512MB

## 🆘 Troubleshooting

### Si l'erreur trust proxy revient
1. Vérifiez que `TRUST_PROXY=true` est dans Railway Variables
2. Vérifiez que le code a été redéployé
3. Consultez les logs : `railway logs`

### Si la base de données ne se connecte pas
1. Vérifiez Network Access dans MongoDB Atlas : `0.0.0.0/0`
2. Vérifiez les credentials dans `MONGODB_URI`
3. Testez la connexion depuis Railway logs

---

## 🎉 Résultat

✅ **Application déployée avec succès sur Railway**  
✅ **Trust proxy error résolu**  
✅ **Rate limiting fonctionnel**  
✅ **MongoDB Atlas connecté**  

Votre API UK Bus GO est maintenant accessible publiquement !
