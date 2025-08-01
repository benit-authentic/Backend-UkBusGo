# 🚀 Guide Rapide - Intégration FedaPay

## ⚡ Installation en 5 Minutes

### 1. **Prérequis**
```bash
# Vérifier Node.js
node --version  # >= 18.0.0

# Vérifier que le serveur démarre
npm start
```

### 2. **Configuration FedaPay**

#### A. Obtenir les clés FedaPay
1. Aller sur [dashboard.fedapay.com](https://dashboard.fedapay.com)
2. Créer un compte / Se connecter
3. **Développeurs** → **Clés API**
4. Copier :
   - `sk_sandbox_...` (Clé secrète)
   - `pk_sandbox_...` (Clé publique)

#### B. Configurer le .env
```env
# Ajouter dans votre fichier .env
FEDAPAY_API_KEY=sk_sandbox_VOTRE_CLE_SECRETE_ICI
FEDAPAY_PUBLIC_KEY=pk_sandbox_VOTRE_CLE_PUBLIQUE_ICI
FEDAPAY_ENVIRONMENT=sandbox
WEBHOOK_URL=https://VOTRE-URL-NGROK.ngrok.io/api/fedapay/webhook
FEDAPAY_WEBHOOK_SECRET=wh_sandbox_A_REMPLIR_APRES_CREATION_WEBHOOK
```

### 3. **Exposer l'API (pour tests)**

#### Option A : Ngrok (Recommandé)
```bash
# Terminal 1 : Démarrer le serveur
npm start

# Terminal 2 : Exposer avec ngrok
npx ngrok http 5000
# Copier l'URL HTTPS (ex: https://abc123.ngrok.io)
```

#### Option B : LocalTunnel
```bash
npx localtunnel --port 5000 --subdomain ukbus
# URL : https://ukbus.loca.lt
```

### 4. **Créer le Webhook FedaPay**

1. **Dashboard FedaPay** → **Développeurs** → **Webhooks**
2. **Créer un webhook** :
   - **URL** : `https://abc123.ngrok.io/api/fedapay/webhook`
   - **Événements** :
     - ✅ `transaction.created`
     - ✅ `transaction.approved`
     - ✅ `transaction.canceled`
     - ✅ `transaction.declined`
3. **Sauvegarder** et **copier la clé secrète** (`wh_sandbox_...`)
4. **Mettre à jour le .env** avec `FEDAPAY_WEBHOOK_SECRET`

### 5. **Test Complet**

```bash
# Redémarrer le serveur pour prendre en compte le .env
npm start

# Lancer le test FedaPay
node test_fedapay.js
```

**Résultat attendu :**
```
✅ Inscription étudiant
✅ Initiation recharge FedaPay
✅ Statut transaction
✅ Webhook accepté !
🎉 TESTS FEDAPAY TERMINÉS AVEC SUCCÈS !
```

---

## 🧪 Tests avec Vrais Numéros

### Pour tester avec votre téléphone :

1. **Modifier le numéro de test** :
```javascript
// Dans test_fedapay.js, ligne 15
const TEST_PHONE = '90123456'; // Votre vrai numéro FLOOZ
// ou
const TEST_PHONE = '70123456'; // Votre vrai numéro TMONEY
```

2. **Relancer le test** :
```bash
node test_fedapay.js
```

3. **Valider sur votre téléphone** quand vous recevez la notification !

---

## 🔧 Dépannage Rapide

### ❌ "Signature manquante"
- ✅ Vérifier que `FEDAPAY_WEBHOOK_SECRET` est dans le .env
- ✅ Redémarrer le serveur après modification du .env

### ❌ "Transaction non trouvée"
- ✅ Vérifier que les clés FedaPay sont correctes
- ✅ Vérifier la connectivité internet

### ❌ "Numéro invalide"
- ✅ Utiliser le format : `90123456` (8 chiffres)
- ✅ Ou international : `+22890123456`

### ❌ "Webhook 404"
- ✅ Vérifier que l'URL se termine par `/api/fedapay/webhook`
- ✅ Vérifier que ngrok est toujours ouvert

---

## 🚀 Passer en Production

### 1. **Clés Live FedaPay**
```env
FEDAPAY_API_KEY=sk_live_VOTRE_CLE_LIVE
FEDAPAY_PUBLIC_KEY=pk_live_VOTRE_CLE_LIVE
FEDAPAY_ENVIRONMENT=live
WEBHOOK_URL=https://votre-api-prod.com/api/fedapay/webhook
FEDAPAY_WEBHOOK_SECRET=wh_live_VOTRE_CLE_WEBHOOK_LIVE
```

### 2. **Webhook Production**
- Créer un nouveau webhook sur FedaPay avec l'URL de production
- Utiliser les clés live

### 3. **Déploiement**
- Railway : Auto-deploy depuis GitHub
- Render : Connect GitHub repo
- Vercel : `vercel --prod`

---

## 📞 Support

- **Guide complet** : [GUIDE_WEBHOOK_FEDAPAY.md](./GUIDE_WEBHOOK_FEDAPAY.md)
- **Issues** : [GitHub Issues](https://github.com/benit-authentic/FrontMobile-UkBus/issues)
- **Email** : benitedouhsewa@gmail.com

---

<div align="center">
  <strong>🎉 Votre intégration FedaPay est prête ! 🎉</strong>
</div>
