#!/usr/bin/env node

/**
 * Générateur de secrets JWT sécurisés pour UK Bus GO
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 UK Bus GO - Générateur de Secrets JWT\n');

// Générer des secrets cryptographiquement sécurisés
const jwtSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');
const webhookSecret = crypto.randomBytes(16).toString('hex');

console.log('📋 Variables d\'environnement à ajouter dans Railway/Render:\n');

console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log(`PAYGATE_WEBHOOK_SECRET=${webhookSecret}`);

console.log('\n📝 Pour votre fichier .env local:\n');

console.log(`# Secrets générés automatiquement - ${new Date().toISOString()}`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log(`PAYGATE_WEBHOOK_SECRET=${webhookSecret}`);

console.log('\n✅ Secrets générés avec succès !');
console.log('⚠️  Gardez ces secrets en sécurité et ne les partagez jamais.');
console.log('🔄 Vous pouvez relancer ce script pour générer de nouveaux secrets.');

// Optionnel: sauvegarder dans un fichier
const fs = require('fs');
const secretsContent = `# UK Bus GO - Secrets générés le ${new Date().toISOString()}
# ⚠️  Gardez ce fichier secret ! Ne pas commit sur Git.

JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${refreshSecret}
PAYGATE_WEBHOOK_SECRET=${webhookSecret}

# Autres variables d'environnement requises:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bus-tickets
# PAYGATE_API_KEY=your_paygate_api_key
# NODE_ENV=production
`;

try {
  fs.writeFileSync('.env.secrets', secretsContent);
  console.log('\n💾 Secrets sauvegardés dans .env.secrets');
  console.log('📁 Ajoutez .env.secrets à votre .gitignore !');
} catch (error) {
  console.log('\n❌ Impossible de sauvegarder le fichier .env.secrets');
}

console.log('\n🚀 Prêt pour le déploiement !');
