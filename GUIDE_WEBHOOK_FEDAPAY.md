# 🚀 Guide complet : Créer un webhook FedaPay

## 🔗 Étape 1 : Obtenir votre URL de webhook

### Pour les tests en local :
1. **Démarrez votre serveur :**
   ```bash
   npm start
   ```

2. **Dans un NOUVEAU terminal, exposez avec ngrok :**
   ```bash
   ngrok http 5000
   ```

3. **Copiez l'URL HTTPS** qui s'affiche (exemple: `https://abc123.ngrok.io`)

4. **Votre URL webhook sera :**
   ```
   https://abc123.ngrok.io/api/fedapay/webhook
   ```

### Pour la production :
```
https://votre-domaine.com/api/fedapay/webhook
```

---

## 🌐 Étape 2 : Créer le webhook sur FedaPay

### 1. **Connexion au dashboard :**
   - Allez sur : https://dashboard.fedapay.com
   - Connectez-vous avec vos identifiants FedaPay

### 2. **Navigation vers les webhooks :**
   ```
   Dashboard → Développeurs → Webhooks → Créer un webhook
   ```

### 3. **Configuration du webhook :**

   **URL de destination :**
   ```
   https://abc123.ngrok.io/api/fedapay/webhook
   ```
   *(Remplacez par votre vraie URL)*

   **Événements à sélectionner :**
   - ✅ `transaction.created`
   - ✅ `transaction.approved` 
   - ✅ `transaction.canceled`
   - ✅ `transaction.declined`
   - ✅ `transaction.transferred`

   **En-têtes HTTP (optionnel) :**
   ```
   Content-Type: application/json
   ```

### 4. **Récupérer la clé secrète :**
   - Après création, cliquez sur "Click to reveal"
   - Copiez la clé secrète (ex: `wh_sandbox_abc123...`)

---

## ⚙️ Étape 3 : Configurer votre .env

Mettez à jour votre fichier `.env` :

```env
# Webhook FedaPay
WEBHOOK_URL=https://abc123.ngrok.io/api/fedapay/webhook
FEDAPAY_WEBHOOK_SECRET=wh_sandbox_votre_cle_secrete_ici
```

---

## 🧪 Étape 4 : Tester le webhook

### Test 1 : Vérifier que le webhook reçoit les appels
```bash
# Dans les logs de votre serveur, vous devriez voir :
# ✅ Webhook FedaPay reçu: transaction.created
```

### Test 2 : Lancer un paiement de test
```bash
node test_fedapay.js
```

### Test 3 : Vérifier les événements sur FedaPay
- Dashboard → Webhooks → Votre webhook → Logs

---

## ❌ Problèmes courants

### 1. **Erreur 404 Not Found**
   - ✅ Vérifiez que l'URL se termine par `/api/fedapay/webhook`
   - ✅ Vérifiez que le serveur est démarré

### 2. **Erreur de signature**
   - ✅ Vérifiez que `FEDAPAY_WEBHOOK_SECRET` est correct
   - ✅ Vérifiez qu'il n'y a pas d'espaces en trop

### 3. **Ngrok qui se ferme**
   - ✅ Laissez ngrok ouvert pendant tous vos tests
   - ✅ Si l'URL change, mettez à jour le webhook FedaPay

---

## 🚀 URLs importantes

- **Dashboard FedaPay :** https://dashboard.fedapay.com
- **Documentation :** https://docs.fedapay.com
- **API Reference :** https://docs.fedapay.com/api

---

## 💡 Conseil pro

Pour éviter de reconfigurer le webhook à chaque test, utilisez un service comme ngrok avec un sous-domaine fixe (version payante) ou déployez directement sur un serveur de staging.
