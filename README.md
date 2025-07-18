# 🚌 UK Bus GO - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.0+-lightgrey.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-red.svg)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/API-Documented-orange.svg)](https://swagger.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **API REST sécurisée pour la digitalisation des tickets de bus universitaires**  
> Système complet de gestion des étudiants, chauffeurs, transactions et validation QR codes

## 🎯 À Propos

**UK Bus GO Backend** est l'API qui alimente l'application mobile Flutter de gestion des tickets de bus de l'Université de Kara. Elle fournit une solution complète pour :

- 🎓 **Gestion des étudiants** - Inscription, authentification, solde
- 🚐 **Interface chauffeurs** - Validation des tickets via QR codes
- 👥 **Panel administrateur** - Statistiques et gestion des utilisateurs
- 💳 **Intégration paiement** - Support FLOOZ/TMONEY via PayGate
- 🔐 **Sécurité avancée** - JWT, validation, rate limiting

## 🛠️ Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Node.js** | 18+ | Runtime JavaScript |
| **TypeScript** | 5.0+ | Typage statique et robustesse |
| **Express.js** | 5.0+ | Framework web rapide |
| **MongoDB** | 6.0+ | Base de données NoSQL |
| **Mongoose** | 8.0+ | ODM pour MongoDB |
| **JWT** | 9.0+ | Authentification sécurisée |
| **Zod** | 4.0+ | Validation des schémas |
| **Swagger** | - | Documentation interactive |
| **Winston** | 3.0+ | Logging professionnel |
| **Docker** | - | Conteneurisation |

## ⚡ Démarrage Rapide

### Prérequis
- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **MongoDB** 6.0+ ([Installation](https://www.mongodb.com/try/download/community))
- **Git** ([Télécharger](https://git-scm.com/))

### Installation Locale

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/backuk.git
cd backuk

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer le fichier .env avec vos paramètres

# 4. Démarrer MongoDB (si local)
mongod --dbpath /path/to/your/db

# 5. Lancer le serveur de développement
npm run dev
```

🎉 **L'API est maintenant accessible sur http://localhost:5000**

### 🐳 Avec Docker (Recommandé)

```bash
# Démarrer tous les services (API + MongoDB)
docker-compose up --build

# En arrière-plan
docker-compose up -d --build
```

## 📊 Fonctionnalités

### 👨‍🎓 Module Étudiants
- ✅ Inscription et authentification
- ✅ Gestion du solde et historique
- ✅ Achat de tickets avec QR code
- ✅ Recharge mobile money (FLOOZ/TMONEY)
- ✅ Validation des transactions

### 🚐 Module Chauffeurs  
- ✅ Interface d'authentification
- ✅ Scanner et valider les QR codes
- ✅ Historique des validations quotidiennes
- ✅ Gestion des trajets

### 👥 Module Administrateur
- ✅ Dashboard avec statistiques globales
- ✅ Gestion des chauffeurs
- ✅ Monitoring des transactions
- ✅ Rapports et analytics

### 💳 Système de Paiement
- ✅ Intégration PayGate API
- ✅ Support FLOOZ et TMONEY
- ✅ Webhooks de confirmation
- ✅ Gestion des échecs de paiement

## 🔐 Authentification & Sécurité

### Système JWT Dual-Token
- **Access Token** : Durée de vie 15 minutes (sécurité renforcée)
- **Refresh Token** : Durée de vie 1 an (expérience utilisateur fluide)
- **Invalidation automatique** : En cas de changement critique (mot de passe, etc.)
- **Stockage sécurisé** : httpOnly cookies (web) / secure storage (mobile)

### Mesures de Sécurité
| Sécurité | Implementation |
|----------|----------------|
| **Rate Limiting** | 100 req/15min par IP |
| **CORS** | Origins autorisées uniquement |
| **Helmet** | Headers de sécurité HTTP |
| **Validation** | Schémas Zod stricts |
| **Hash Passwords** | bcrypt avec salt rounds |
| **HTTPS** | Obligatoire en production |

## 🗂️ Architecture & Modèles

### Structure du Projet
```
src/
├── controllers/     # Logique métier par ressource
│   ├── auth.controller.ts
│   ├── student.controller.ts
│   ├── driver.controller.ts
│   ├── admin.controller.ts
│   └── validation.controller.ts
├── models/          # Schémas Mongoose
├── routes/          # Endpoints REST organisés
├── middlewares/     # Auth, validation, sécurité
├── services/        # PayGate, email, utils
├── config/          # DB, environnement, Swagger
├── types/           # Types et interfaces TypeScript
└── utils/           # Fonctions utilitaires
```

### 📋 Modèles de Données

#### Student Model
```typescript
interface Student {
  id: string;              // ObjectId MongoDB
  firstName: string;       // Prénom étudiant
  lastName: string;        // Nom de famille
  phone: string;           // Numéro unique (login)
  password: string;        // Hash bcrypt
  balance: number;         // Solde en FCFA
  history: Transaction[];  // Historique complet
  createdAt: Date;
  updatedAt: Date;
}
```

#### Driver Model
```typescript
interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;           // Numéro unique
  password: string;        // Hash bcrypt
  validationsToday: number; // Compteur quotidien
  createdAt: Date;
  updatedAt: Date;
}
```

#### Transaction Model
```typescript
interface Transaction {
  id: string;
  identifier: string;      // ID PayGate unique
  student: ObjectId;       // Référence Student
  amount: number;          // Montant en FCFA
  status: 'pending' | 'success' | 'failed';
  network: 'FLOOZ' | 'TMONEY';
  type: 'purchase' | 'recharge';
  createdAt: Date;
}
```

#### Validation Model
```typescript
interface Validation {
  id: string;
  student: ObjectId;       // Référence Student
  driver: ObjectId;        // Référence Driver
  qrData: string;          // Données QR scannées
  timestamp: Date;         // Horodatage précis
}
```

## 🚀 API Endpoints

### 🔑 Authentification
```http
POST /api/students/login      # Connexion étudiant
POST /api/drivers/login       # Connexion chauffeur
POST /api/admins/login        # Connexion admin
POST /api/auth/refresh        # Renouveler access token
POST /api/auth/logout         # Déconnexion (invalide tokens)
```

### 👨‍🎓 Étudiants
```http
POST /api/students/register   # Inscription
GET  /api/students/me         # Profil utilisateur
POST /api/students/recharge   # Recharge mobile money
POST /api/students/buy-ticket # Achat tickets + QR
GET  /api/students/history    # Historique transactions
```

### 🚐 Chauffeurs
```http
POST /api/drivers/register    # Inscription chauffeur
GET  /api/drivers/me          # Profil chauffeur
GET  /api/drivers/history     # Validations quotidiennes
```

### 👥 Administrateurs
```http
GET  /api/admins/dashboard    # Statistiques globales
GET  /api/admins/drivers      # Liste chauffeurs
POST /api/admins/drivers      # Créer chauffeur
DEL  /api/admins/drivers/:id  # Supprimer chauffeur
```

### ✅ Validations
```http
POST /api/validations         # Valider ticket QR
GET  /api/validations/stats   # Statistiques validations
```

### 💳 Transactions
```http
GET  /api/transactions/:id/status    # Statut transaction
POST /api/paygate/webhook           # Callback PayGate
```

## 📱 Exemples d'Utilisation

### Connexion Étudiant
```bash
curl -X POST http://localhost:5000/api/students/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "90123456",
    "password": "password123"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "student": {
      "id": "64f...",
      "firstName": "Jean",
      "lastName": "Dupont",
      "phone": "90123456",
      "balance": 2500
    }
  },
  "message": "Connexion réussie"
}
```

### Achat de Tickets
```bash
curl -X POST http://localhost:5000/api/students/buy-ticket \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "balance": 1500,
    "lowBalance": false
  },
  "message": "2 ticket(s) acheté(s) avec succès"
}
```

### Validation QR Code
```bash
curl -X POST http://localhost:5000/api/validations \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrPayload": "{\"id\":\"studentId\",\"balance\":350,\"ts\":1720876800000}"
  }'
```

## 🔧 Configuration

### Variables d'Environnement (.env)
```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données
MONGODB_URI=mongodb://localhost:27017/bus-tickets

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# PayGate API
PAYGATE_API_KEY=your_paygate_api_key
PAYGATE_BASE_URL=https://api.paygate.tg

# Logging
LOG_LEVEL=info
```

### Configuration MongoDB Atlas (Production)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bus-tickets?retryWrites=true&w=majority
```

## 📚 Documentation API

### 🔗 Swagger UI
- **Local** : [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **Documentation Markdown** : [SWAGGER_API_DOC.md](./SWAGGER_API_DOC.md)

### Format de Réponse Standard
```typescript
// Succès
{
  "success": true,
  "data": any,           // Données de la réponse
  "message": string      // Message descriptif
}

// Erreur
{
  "success": false,
  "message": string,     // Description de l'erreur
  "errors"?: string[]    // Détails d'erreurs de validation
}
```

### Codes de Statut HTTP
| Code | Signification | Usage |
|------|---------------|-------|
| **200** | OK | Opération réussie |
| **201** | Created | Ressource créée |
| **400** | Bad Request | Erreur de validation |
| **401** | Unauthorized | Authentification requise |
| **403** | Forbidden | Permissions insuffisantes |
| **404** | Not Found | Ressource introuvable |
| **429** | Too Many Requests | Rate limit dépassé |
| **500** | Internal Server Error | Erreur serveur |

## 🧪 Tests & Qualité

### Scripts Disponibles
```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Compilation TypeScript
npm run start            # Serveur de production

# Tests
npm run test             # Tests unitaires
npm run test:cov         # Tests avec couverture
npm run test:watch       # Tests en mode watch

# Qualité
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # Vérification TypeScript
```

### Couverture de Tests
- 🎯 **Objectif** : 80% minimum
- 🧪 **Framework** : Jest + Supertest
- 📊 **Rapport** : `coverage/lcov-report/index.html`

### Standards de Code
- **ESLint** : Règles strictes TypeScript
- **Prettier** : Formatage automatique
- **Husky** : Hooks Git pour la qualité
- **Conventional Commits** : Messages normalisés

## 🚀 Déploiement

### 🌐 Déploiement Gratuit

#### Option 1: Railway (Recommandé)
```bash
# 1. Installer Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialiser le projet
railway init

# 4. Ajouter les variables d'environnement
railway variables set MONGODB_URI=mongodb+srv://...
railway variables set JWT_SECRET=...

# 5. Déployer
railway up
```

#### Option 2: Render
1. Connecter votre repository GitHub à [Render](https://render.com)
2. Créer un **Web Service**
3. Configurer :
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
4. Ajouter les variables d'environnement

#### Option 3: Vercel (Serverless)
```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod
```

### 🗄️ Base de Données MongoDB

#### MongoDB Atlas (Gratuit)
1. Créer un compte sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Créer un cluster gratuit (512 MB)
3. Configurer l'accès réseau (IP autorisées)
4. Créer un utilisateur de base de données
5. Récupérer la connection string

#### Railway PostgreSQL + Prisma (Alternative)
```bash
# Ajouter Railway PostgreSQL
railway add postgresql

# Migrer vers Prisma (optionnel)
npm install prisma @prisma/client
npx prisma init
```

### 🔧 Configuration Production

#### Variables d'Environnement Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/bus-tickets-prod
JWT_SECRET=super_secure_production_secret
JWT_REFRESH_SECRET=super_secure_refresh_secret
PAYGATE_API_KEY=prod_paygate_key
CORS_ORIGIN=https://yourapp.com
```

#### Health Check Endpoint
```http
GET /health              # Status de l'API
GET /api/status          # Status détaillé avec DB
```

## 📈 Monitoring & Logs

### Logging avec Winston
- **Levels** : error, warn, info, debug
- **Format** : JSON structuré
- **Storage** : Fichiers rotatifs + Console

### Intégrations Recommandées
- **Sentry** : Monitoring d'erreurs
- **LogRocket** : Session replay
- **New Relic** : Performance monitoring
- **Uptime Robot** : Surveillance de disponibilité

## 🔒 Sécurité en Production

### Checklist Sécurité
- [ ] HTTPS obligatoire (SSL/TLS)
- [ ] Variables sensibles en environnement
- [ ] Rate limiting configuré
- [ ] CORS restreint aux domaines autorisés
- [ ] Headers de sécurité (Helmet)
- [ ] Validation stricte des entrées
- [ ] Logs sécurisés (pas de données sensibles)
- [ ] Rotation régulière des secrets JWT
- [ ] Monitoring des tentatives d'intrusion

### Configuration HTTPS
```javascript
// server.ts - Production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

## 🤝 Contribution

### Guidelines
1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** vos changements (`git commit -m 'feat: add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Standards de Code
- **TypeScript strict** : Typage complet
- **ESLint + Prettier** : Code formaté
- **Tests unitaires** : Couverture 80%+
- **Documentation** : JSDoc pour les fonctions
- **Conventional Commits** : Messages normalisés

## 📞 Support & Contact

- **Issues GitHub** : [Créer une issue](https://github.com/votre-username/backuk/issues)
- **Documentation** : [Wiki du projet](https://github.com/votre-username/backuk/wiki)
- **Email** : contact@ukbusgo.com

## 📄 Licence

Ce projet est sous licence [MIT](./LICENSE) - voir le fichier LICENSE pour plus de détails.

---

## 🙏 Remerciements

- **Université de Kara** - Pour le soutien institutionnel
- **Communauté étudiante** - Pour les retours et tests
- **Équipe de développement** - Pour la passion et l'engagement

---

<div align="center">
  <strong>Made with ❤️ for University of Kara students</strong><br>
  <em>Digitalisation des transports universitaires - 2025</em>
</div>
