#!/usr/bin/env node

/**
 * Script de diagnostic pour Railway
 * Vérifie toutes les variables d'environnement nécessaires
 */

console.log('🔍 Diagnostic Variables d\'Environnement Railway\n');

// Variables obligatoires pour le démarrage
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

// Variables recommandées
const recommendedVars = [
  'TRUST_PROXY',
  'CORS_ORIGIN',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'SEED_DATABASE',
  'DEBUG_MODE'
];

console.log('📋 Variables d\'environnement détectées:');
console.log('=====================================\n');

let missingRequired = [];
let missingRecommended = [];

// Vérifier les variables obligatoires
console.log('🔴 Variables OBLIGATOIRES:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Masquer les secrets sensibles
    const displayValue = varName.includes('SECRET') || varName.includes('URI') 
      ? value.substring(0, 20) + '...'
      : value;
    console.log(`  ✅ ${varName}=${displayValue}`);
  } else {
    console.log(`  ❌ ${varName}=MANQUANT`);
    missingRequired.push(varName);
  }
});

console.log('\n🟡 Variables RECOMMANDÉES:');
recommendedVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}=${value}`);
  } else {
    console.log(`  ⚠️  ${varName}=MANQUANT`);
    missingRecommended.push(varName);
  }
});

console.log('\n📊 RÉSUMÉ:');
console.log('=========');

if (missingRequired.length === 0) {
  console.log('✅ Toutes les variables obligatoires sont présentes');
} else {
  console.log(`❌ ${missingRequired.length} variables obligatoires manquantes:`);
  missingRequired.forEach(v => console.log(`   - ${v}`));
}

if (missingRecommended.length === 0) {
  console.log('✅ Toutes les variables recommandées sont présentes');
} else {
  console.log(`⚠️  ${missingRecommended.length} variables recommandées manquantes:`);
  missingRecommended.forEach(v => console.log(`   - ${v}`));
}

console.log('\n🚀 STATUS:');
if (missingRequired.length === 0) {
  console.log('✅ L\'application PEUT démarrer');
  
  // Test de connexion MongoDB
  console.log('\n🧪 Test de connexion MongoDB...');
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    if (mongoUri.includes('mongodb+srv://')) {
      console.log('✅ Format MongoDB Atlas détecté');
    } else if (mongoUri.includes('mongodb://')) {
      console.log('✅ Format MongoDB local détecté');
    } else {
      console.log('⚠️  Format MongoDB URI non reconnu');
    }
    
    if (mongoUri.includes('username:password')) {
      console.log('❌ MONGODB_URI contient encore des placeholders!');
      console.log('   Remplacez "username:password" par vos vrais credentials');
    }
  }
  
} else {
  console.log('❌ L\'application NE PEUT PAS démarrer');
  console.log('   Ajoutez les variables manquantes dans Railway');
}

console.log('\n🔧 Variables à ajouter sur Railway:');
console.log('===================================');

if (missingRequired.length > 0 || missingRecommended.length > 0) {
  console.log('\nCopiez-collez ces variables dans Railway Variables:\n');
  
  const allMissing = [...missingRequired, ...missingRecommended];
  
  allMissing.forEach(varName => {
    switch(varName) {
      case 'NODE_ENV':
        console.log('NODE_ENV=production');
        break;
      case 'PORT':
        console.log('PORT=5000');
        break;
      case 'MONGODB_URI':
        console.log('MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/bus-tickets?retryWrites=true&w=majority');
        break;
      case 'JWT_SECRET':
        console.log(`JWT_SECRET=${require('crypto').randomBytes(32).toString('hex')}`);
        break;
      case 'JWT_REFRESH_SECRET':
        console.log(`JWT_REFRESH_SECRET=${require('crypto').randomBytes(32).toString('hex')}`);
        break;
      case 'TRUST_PROXY':
        console.log('TRUST_PROXY=true');
        break;
      case 'CORS_ORIGIN':
        console.log('CORS_ORIGIN=https://back-ukbus-production.up.railway.app');
        break;
      case 'JWT_EXPIRES_IN':
        console.log('JWT_EXPIRES_IN=15m');
        break;
      case 'JWT_REFRESH_EXPIRES_IN':
        console.log('JWT_REFRESH_EXPIRES_IN=365d');
        break;
      case 'SEED_DATABASE':
        console.log('SEED_DATABASE=false');
        break;
      case 'DEBUG_MODE':
        console.log('DEBUG_MODE=false');
        break;
      default:
        console.log(`${varName}=VALEUR_REQUISE`);
    }
  });
}

console.log('\n📝 Instructions Railway:');
console.log('1. Ouvrez votre projet Railway');
console.log('2. Allez dans l\'onglet Variables');
console.log('3. Cliquez sur "Add Variable"');
console.log('4. Ajoutez chaque variable ci-dessus');
console.log('5. Redéployez automatiquement');

console.log('\n🆘 Si l\'erreur persiste:');
console.log('- Vérifiez les logs Railway: railway logs');
console.log('- Testez localement: npm run build && npm start');
console.log('- Vérifiez MongoDB Atlas Network Access (0.0.0.0/0)');

// Afficher les informations système
console.log('\n🖥️  Informations système:');
console.log(`Node.js: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Working Directory: ${process.cwd()}`);

process.exit(missingRequired.length > 0 ? 1 : 0);
