#!/usr/bin/env node

/**
 * Script pour générer les variables d'environnement pour Railway
 * Usage: node scripts/generate-production-env.js
 */

const crypto = require('crypto');

console.log('🔐 Génération des secrets pour Railway...\n');

// Générer des secrets JWT sécurisés
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
const webhookSecret = crypto.randomBytes(32).toString('hex');

console.log('📋 Variables d\'environnement à configurer sur Railway:\n');

const envVars = {
  // Configuration serveur
  'NODE_ENV': 'production',
  'PORT': '5000',
  'TRUST_PROXY': 'true',
  
  // Base de données (à remplacer par votre connexion MongoDB Atlas)
  'MONGODB_URI': 'mongodb+srv://username:password@cluster.mongodb.net/bus-tickets?retryWrites=true&w=majority',
  
  // JWT Secrets
  'JWT_SECRET': jwtSecret,
  'JWT_REFRESH_SECRET': jwtRefreshSecret,
  'JWT_EXPIRES_IN': '15m',
  'JWT_REFRESH_EXPIRES_IN': '365d',
  
  // PayGate (optionnel pour les tests)
  'PAYGATE_API_KEY': 'your_paygate_api_key_here',
  'PAYGATE_BASE_URL': 'https://sandbox.paygate.tg',
  'PAYGATE_WEBHOOK_SECRET': webhookSecret,
  
  // CORS
  'CORS_ORIGIN': 'https://yourapp.railway.app,https://yourdomain.com',
  
  // Rate limiting
  'RATE_LIMIT_WINDOW_MS': '900000',
  'RATE_LIMIT_MAX_REQUESTS': '100',
  
  // Désactiver le seeding en production
  'SEED_DATABASE': 'false',
  'DEBUG_MODE': 'false'
};

// Afficher les variables
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n📝 Instructions:');
console.log('1. Connectez-vous à Railway: https://railway.app');
console.log('2. Créez un nouveau projet');
console.log('3. Allez dans Variables > Add Variable');
console.log('4. Ajoutez chaque variable ci-dessus');
console.log('5. ⚠️  Remplacez MONGODB_URI par votre vraie connexion MongoDB Atlas');
console.log('6. ⚠️  Remplacez CORS_ORIGIN par vos vrais domaines');
console.log('7. Déployez votre code');

console.log('\n🚀 Commandes Railway:');
console.log('railway login');
console.log('railway link');
console.log('railway up');

console.log('\n🧪 Test des endpoints après déploiement:');
console.log('GET https://yourapp.railway.app/health');
console.log('GET https://yourapp.railway.app/api/docs');
console.log('POST https://yourapp.railway.app/api/students/login');

console.log('\n📋 Variables copiables pour Railway:');
console.log('================================');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});
