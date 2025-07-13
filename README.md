# Digitalisation de l’Achat de Tickets de Bus – Backend

API REST Node.js/TypeScript pour la gestion digitale des tickets de bus (étudiants, chauffeurs, admins, transactions, paiements mobile). Sécurisée, modulaire, documentée, prête pour production et CI/CD.

---

## 🛠️ Stack Technique
- **Node.js + TypeScript (strict)** : Typage fort, robustesse
- **Express** : Framework HTTP
- **MongoDB (Mongoose)** : Modélisation NoSQL
- **JWT Auth** : Authentification sécurisée (access/refresh tokens)
- **Zod** : Validation stricte des entrées
- **Swagger** : Documentation interactive (UI + Markdown)
- **Winston** : Logging centralisé
- **Docker** : Conteneurisation

---

## 📁 Structure du projet
```
src/
  controllers/   // Logique métier par ressource
  models/        // Schémas Mongoose
  routes/        // Endpoints REST (1 fichier par ressource)
  middlewares/   // Auth, validation, sécurité, erreurs
  services/      // Paiement, email, etc.
  utils/         // Fonctions utilitaires
  config/        // Connexions, variables globales
  types/         // Types et interfaces TS
  index.ts       // Entrée principale
```

---

## 🚀 Lancement local

```bash
npm install
npm run dev
```

- L’API tourne sur http://localhost:5000
- Swagger UI : http://localhost:5000/api/docs

---

## 🐳 Docker

```bash
docker-compose up --build
```
- MongoDB et API démarrent automatiquement

---

## 🔑 Variables d’environnement (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bus-tickets
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
PAYGATE_API_KEY=your_paygate_api_key
```

---

## 📚 Documentation API
- Swagger UI : http://localhost:5000/api/docs
- [Documentation complète Markdown](./SWAGGER_API_DOC.md)

---

## 🔒 Sécurité & Bonnes pratiques
- Endpoints protégés par JWT (`Authorization: Bearer <token>`)
- Validation stricte (Zod), gestion centralisée des erreurs
- CORS, helmet, express-rate-limit activés
- Monitoring Winston (logs) et prêt pour Sentry
- Respect des conventions REST, statuts HTTP clairs
- Variables sensibles dans `.env` (jamais versionnées)

---

## 📦 Scripts utiles
- `npm run build` : build TypeScript
- `npm start` : lancer l’API en prod
- `npm run test:cov` : tests + couverture (Jest)

---

## 🧪 Exemples de réponses API

Réponse standard :
```json
{
  "success": true,
  "data": { ... },
  "message": "Opération réussie"
}
```
Erreur :
```json
{
  "success": false,
  "message": "Erreur explicite ou message de validation"
}
```

---

## 📝 Tests & Qualité
- 80% de couverture minimum (Jest)
- Lint/format : ESLint + Prettier
- CI/CD prêt pour GitHub Actions

---

## 📄 Licence
MIT
