# Documentation Swagger – API Bus Tickets

Cette documentation décrit l’ensemble des endpoints REST de l’API, leurs paramètres, réponses, statuts, et exemples de payloads. Elle est conforme à la structure actuelle du projet.

---

## Authentification

### POST /api/students/login
- **Description** : Connexion étudiant
- **Body** :
```json
{
  "phone": "string",
  "password": "string"
}
```
- **Réponse 200** :
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "student": { "id": "string", "firstName": "string", "lastName": "string", "phone": "string" }
  },
  "message": "Connexion réussie"
}
```

### POST /api/drivers/login
- **Description** : Connexion chauffeur
- **Body** :
```json
{
  "phone": "string",
  "password": "string"
}
```
- **Réponse 200** :
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "driver": { "id": "string", "firstName": "string", "lastName": "string", "phone": "string" }
  },
  "message": "Connexion réussie"
}
```

### POST /api/admins/login
- **Description** : Connexion admin
- **Body** :
```json
{
  "phone": "string",
  "password": "string"
}
```
- **Réponse 200** :
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "admin": { "id": "string", "firstName": "string", "lastName": "string", "phone": "string" }
  },
  "message": "Connexion réussie"
}
```

---

## Étudiants

### POST /api/students/register
- **Description** : Inscription étudiant
- **Body** :
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "password": "string"
}
```
- **Réponse 201** :
```json
{
  "success": true,
  "data": { "id": "string", "firstName": "string", "lastName": "string", "phone": "string" },
  "message": "Inscription réussie"
}
```

### POST /api/students/recharge
- **Description** : Recharger le solde
- **Body** :
```json
{
  "phone": "string",
  "amount": 1000,
  "network": "FLOOZ" | "TMONEY"
}
```
- **Réponse 200** :
```json
{
  "success": true,
  "data": { "txReference": "string", "identifier": "string" },
  "message": "Paiement initié, validez sur votre mobile."
}
```

### POST /api/students/buy-ticket
- **Description** : Acheter un ou plusieurs tickets
- **Body** :
```json
{
  "quantity": 2
}
```
- **Réponse 200** :
```json
{
  "success": true,
  "data": { "qr": "qrcode_base64", "balance": 350, "lowBalance": false },
  "message": "Ticket(s) acheté(s) avec succès"
}
```

### GET /api/students/history
- **Description** : Historique étudiant
- **Réponse 200** :
```json
{
  "success": true,
  "data": [ { "type": "purchase", "amount": 500, "date": "2025-07-13T12:00:00Z" } ],
  "message": "Historique récupéré"
}
```

---

## Chauffeurs

### POST /api/drivers/register
- **Description** : Inscription chauffeur
- **Body** :
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "password": "string"
}
```
- **Réponse 201** :
```json
{
  "success": true,
  "data": { "id": "string", "firstName": "string", "lastName": "string", "phone": "string" },
  "message": "Inscription chauffeur réussie"
}
```

### GET /api/drivers/history
- **Description** : Historique des validations du jour
- **Réponse 200** :
```json
{
  "success": true,
  "data": [ { "student": { "firstName": "string" }, "date": "2025-07-13T12:00:00Z" } ],
  "message": "Historique du jour récupéré"
}
```

---

## Admins

### POST /api/admins/register
- **Description** : Inscription admin
- **Body** :
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "password": "string"
}
```
- **Réponse 201** :
```json
{
  "success": true,
  "data": { "id": "string", "firstName": "string", "lastName": "string", "phone": "string" },
  "message": "Inscription admin réussie"
}
```

### GET /api/admins/dashboard
- **Description** : Statistiques globales
- **Réponse 200** :
```json
{
  "success": true,
  "data": {
    "students": 100,
    "drivers": 20,
    "admins": 2,
    "totalSales": 10000,
    "totalTransactions": 200,
    "validationsToday": 15
  },
  "message": "Statistiques dashboard"
}
```

### GET /api/admins/drivers
- **Description** : Lister tous les chauffeurs
- **Réponse 200** :
```json
{
  "success": true,
  "data": [ { "id": "string", "firstName": "string", "lastName": "string", "phone": "string" } ],
  "message": "Liste des chauffeurs"
}
```

### POST /api/admins/drivers
- **Description** : Ajouter un chauffeur
- **Body** :
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "password": "string"
}
```
- **Réponse 201** :
```json
{
  "success": true,
  "data": { "id": "string", "firstName": "string", "lastName": "string", "phone": "string" },
  "message": "Chauffeur ajouté"
}
```

### DELETE /api/admins/drivers/:id
- **Description** : Supprimer un chauffeur
- **Réponse 200** :
```json
{
  "success": true,
  "message": "Chauffeur supprimé"
}
```

---

## Transactions

### GET /api/transactions/{identifier}/status
- **Description** : Vérifier le statut d'une transaction
- **Réponse 200** :
```json
{
  "success": true,
  "data": { "status": "success", "amount": 2000, "reference": "ref123" },
  "message": "Statut de la transaction"
}
```

---

## Webhook PayGate

### POST /api/paygate/webhook
- **Description** : Webhook callback PayGate
- **Body** :
```json
{
  "identifier": "string",
  "status": "success",
  "amount": 2000,
  "reference": "ref123"
}
```
- **Réponse 200** :
```json
{
  "success": true,
  "message": "Webhook traité avec succès"
}
```

---

## Validations

### POST /api/validations
- **Description** : Valider un ticket (scan QR)
- **Body** :
```json
{
  "qrPayload": "{\"id\":\"studentId\",\"balance\":350,\"ts\":1720876800000}"
}
```
- **Réponse 200** :
```json
{
  "success": true,
  "isValid": true,
  "balance": 350,
  "message": "Ticket validé."
}
```

---

## Sécurité & Auth
- Tous les endpoints protégés nécessitent un JWT valide dans le header `Authorization: Bearer <token>`.
- Les schémas de validation sont stricts (Zod).
- Les erreurs sont retournées au format JSON standardisé.

---

## Exemples d’erreurs
```json
{
  "success": false,
  "message": "Erreur explicite ou message de validation"
}
```
