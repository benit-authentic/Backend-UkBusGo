#!/usr/bin/env node

/**
 * Générateur de variables Railway - PRÊT À COPIER-COLLER
 * Usage: node scripts/railway-env-generator.js
 */

const crypto = require('crypto');

console.log('🚂 GÉNÉRATEUR VARIABLES RAILWAY - COPIER-COLLER');
console.log('=================================================\n');

// Générer des secrets sécurisés
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
const webhookSecret = crypto.randomBytes(32).toString('hex');

console.log('📋 VARIABLES À AJOUTER SUR RAILWAY:');
console.log('====================================\n');
console.log('👉 Copiez CHAQUE ligne ci-dessous dans Railway Variables:\n');

// Variables obligatoires
const vars = [
  ['NODE_ENV', 'production'],
  ['PORT', '5000'],
  ['TRUST_PROXY', 'true'],
  ['MONGODB_URI', 'mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/bus-tickets?retryWrites=true&w=majority'],
  ['JWT_SECRET', jwtSecret],
  ['JWT_REFRESH_SECRET', jwtRefreshSecret],
  ['JWT_EXPIRES_IN', '15m'],
  ['JWT_REFRESH_EXPIRES_IN', '365d'],
  ['CORS_ORIGIN', 'https://back-ukbus-production.up.railway.app'],
  ['RATE_LIMIT_WINDOW_MS', '900000'],
  ['RATE_LIMIT_MAX_REQUESTS', '100'],
  ['SEED_DATABASE', 'false'],
  ['DEBUG_MODE', 'false'],
  ['PAYGATE_API_KEY', 'your_paygate_api_key_here'],
  ['PAYGATE_BASE_URL', 'https://sandbox.paygate.tg'],
  ['PAYGATE_WEBHOOK_SECRET', webhookSecret]
];

// Afficher chaque variable
vars.forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n⚠️  IMPORTANT - REMPLACEZ CES VALEURS:');
console.log('=====================================');
console.log('1. MONGODB_URI: Remplacez USERNAME:PASSWORD par vos vrais credentials MongoDB Atlas');
console.log('2. CORS_ORIGIN: Sera automatiquement généré par Railway, ou utilisez votre domaine');
console.log('3. PAYGATE_API_KEY: Remplacez par votre vraie clé PayGate (optionnel pour les tests)');

console.log('\n🔧 INSTRUCTIONS RAILWAY:');
console.log('========================');
console.log('1. Ouvrez https://railway.app');
console.log('2. Sélectionnez votre projet Back-UkBus');
console.log('3. Allez dans l\'onglet "Variables"');
console.log('4. Pour CHAQUE ligne ci-dessus:');
console.log('   a. Cliquez "Add Variable"');
console.log('   b. Name: copiez la partie AVANT le =');
console.log('   c. Value: copiez la partie APRÈS le =');
console.log('   d. Cliquez "Add"');
console.log('5. Railway redéploiera automatiquement');

console.log('\n📝 EXEMPLE D\'AJOUT:');
console.log('===================');
console.log('Variable 1:');
console.log('  Name: NODE_ENV');
console.log('  Value: production');
console.log('');
console.log('Variable 2:');
console.log('  Name: PORT');
console.log('  Value: 5000');
console.log('');
console.log('Variable 3:');
console.log('  Name: MONGODB_URI');
console.log('  Value: mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/bus-tickets...');
console.log('  ⚠️  REMPLACEZ USERNAME:PASSWORD !');

console.log('\n🚀 APRÈS CONFIGURATION:');
console.log('======================');
console.log('✅ Railway redéploiera automatiquement');
console.log('✅ L\'erreur SIGTERM devrait disparaître');
console.log('✅ Testez: https://votre-app.railway.app/health');

console.log('\n📊 VARIABLES GÉNÉRÉES:');
console.log('======================');
console.log(`JWT_SECRET: ${jwtSecret.substring(0, 20)}... (${jwtSecret.length} caractères)`);
console.log(`JWT_REFRESH_SECRET: ${jwtRefreshSecret.substring(0, 20)}... (${jwtRefreshSecret.length} caractères)`);
console.log(`WEBHOOK_SECRET: ${webhookSecret.substring(0, 20)}... (${webhookSecret.length} caractères)`);

console.log('\n💾 SAUVEGARDE:');
console.log('==============');
console.log('Sauvegardez ces secrets dans un endroit sûr !');
console.log('Ils ne seront plus visibles après fermeture de ce terminal.');

console.log('\n🆘 EN CAS DE PROBLÈME:');
console.log('======================');
console.log('- Vérifiez que TOUTES les variables sont ajoutées');
console.log('- Vérifiez que MONGODB_URI ne contient pas USERNAME:PASSWORD');
console.log('- Consultez les logs: railway logs');
console.log('- Testez localement: npm run build && npm start');

console.log('\n' + '='.repeat(60));
console.log('🎯 PRÊT POUR LE DÉPLOIEMENT RAILWAY !');
console.log('='.repeat(60));
