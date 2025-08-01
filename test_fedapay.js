/**
 * Script de test pour l'intégration FedaPay
 * 
 * Ce script permet de tester les fonctionnalités FedaPay en mode sandbox
 * sans affecter les vraies données ou transactions.
 * 
 * Utilisation :
 * 1. Assurez-vous que le serveur backend est lancé
 * 2. Configurez vos clés FedaPay sandbox dans .env
 * 3. Exécutez : node test_fedapay.js
 */

const axios = require('axios');

// Configuration de test
const API_BASE_URL = 'http://localhost:5000/api'; // Ajustez selon votre port
const TEST_PHONE = '64000001'; // Numéro de test FedaPay (MOOV Bénin succès)
const TEST_AMOUNT = 1500; // 1500 FCFA = 10 tickets

// Simulation d'un étudiant pour test
const TEST_STUDENT = {
  firstName: 'John',
  lastName: 'Test',
  email: 'john.test@ukbus.tg',
  phone: TEST_PHONE,
  password: 'TestPassword123!',
  studentId: 'TEST2025001'
};

/**
 * Fonction pour attendre un délai
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fonction pour afficher les résultats de manière lisible
 */
const logResult = (title, data, isError = false) => {
  const symbol = isError ? '❌' : '✅';
  console.log(`\n${symbol} ${title}`);
  console.log('=' .repeat(50));
  console.log(JSON.stringify(data, null, 2));
  console.log('=' .repeat(50));
};

/**
 * Test complet de l'intégration FedaPay
 */
async function testFedaPayIntegration() {
  console.log('🚀 Démarrage des tests FedaPay');
  console.log('📱 Numéro de test:', TEST_PHONE);
  console.log('💰 Montant de test:', TEST_AMOUNT, 'FCFA');
  
  let studentToken = null;
  let transactionData = null;
  
  try {
    // ===== ÉTAPE 1: INSCRIPTION D'UN ÉTUDIANT DE TEST =====
    console.log('\n📝 ÉTAPE 1: Inscription étudiant de test...');
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/students/register`, TEST_STUDENT);
      logResult('Inscription étudiant', registerResponse.data);
      studentToken = registerResponse.data.data?.accessToken;
    } catch (registerError) {
      if (registerError.response?.status === 409) {
        // Étudiant existe déjà, tenter de se connecter
        console.log('⚠️ Étudiant existe déjà, tentative de connexion...');
        
        const loginResponse = await axios.post(`${API_BASE_URL}/students/login`, {
          phone: TEST_STUDENT.phone,
          password: TEST_STUDENT.password
        });
        
        logResult('Connexion étudiant existant', loginResponse.data);
        studentToken = loginResponse.data.data?.accessToken;
      } else {
        throw registerError;
      }
    }
    
    if (!studentToken) {
      throw new Error('Impossible d\'obtenir le token d\'authentification');
    }
    
    // ===== ÉTAPE 2: INITIATION DE LA RECHARGE FEDAPAY =====
    console.log('\n💳 ÉTAPE 2: Initiation recharge FedaPay...');
    
    const rechargeResponse = await axios.post(
      `${API_BASE_URL}/students/recharge`,
      {
        phone: TEST_PHONE,
        amount: TEST_AMOUNT,
        network: 'FLOOZ' // Test avec Flooz (Moov)
      },
      {
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logResult('Initiation recharge FedaPay', rechargeResponse.data);
    transactionData = rechargeResponse.data.data;
    
    if (!transactionData.fedapay_transaction_id) {
      throw new Error('Pas d\'ID transaction FedaPay reçu');
    }
    
    // ===== ÉTAPE 3: VÉRIFICATION DU STATUT =====
    console.log('\n🔍 ÉTAPE 3: Vérification statut transaction...');
    
    // Attendre un peu avant de vérifier le statut
    await sleep(2000);
    
    const statusResponse = await axios.get(
      `${API_BASE_URL}/transactions/${transactionData.identifier}/status`,
      {
        headers: {
          'Authorization': `Bearer ${studentToken}`
        }
      }
    );
    
    logResult('Statut transaction', statusResponse.data);
    
    // ===== ÉTAPE 4: SIMULATION D'UN WEBHOOK FEDAPAY =====
    console.log('\n🔔 ÉTAPE 4: Simulation webhook FedaPay (transaction.approved)...');
    
    const webhookPayload = {
      name: 'transaction.approved',
      entity: {
        id: transactionData.fedapay_transaction_id,
        reference: transactionData.fedapay_reference,
        merchant_reference: `UKBUS-${Date.now()}-test`,
        amount: TEST_AMOUNT,
        status: 'approved',
        custom_metadata: {
          student_id: 'test-student-id',
          service: 'ukbus_recharge',
          network: 'FLOOZ'
        }
      }
    };
    
    const webhookResponse = await axios.post(`${API_BASE_URL}/fedapay/webhook`, webhookPayload);
    logResult('Réponse webhook FedaPay', webhookResponse.data);
    
    // ===== ÉTAPE 5: VÉRIFICATION FINALE =====
    console.log('\n🎯 ÉTAPE 5: Vérification finale...');
    
    await sleep(1000);
    
    const finalStatusResponse = await axios.get(
      `${API_BASE_URL}/transactions/${transactionData.identifier}/status`,
      {
        headers: {
          'Authorization': `Bearer ${studentToken}`
        }
      }
    );
    
    logResult('Statut final', finalStatusResponse.data);
    
    // ===== RÉSUMÉ =====
    console.log('\n🎉 TESTS FEDAPAY TERMINÉS AVEC SUCCÈS !');
    console.log('=' .repeat(60));
    console.log('📊 Résumé des tests :');
    console.log(`   ✅ Inscription/Connexion étudiant : OK`);
    console.log(`   ✅ Initiation paiement FedaPay : OK`);
    console.log(`   ✅ Vérification statut : OK`);
    console.log(`   ✅ Webhook simulation : OK`);
    console.log(`   ✅ Vérification finale : OK`);
    console.log('=' .repeat(60));
    
    console.log('\n📋 Prochaines étapes :');
    console.log('   1. Configurez vos vraies clés FedaPay');
    console.log('   2. Configurez l\'URL webhook dans FedaPay dashboard');
    console.log('   3. Testez avec de vrais numéros togolais');
    console.log('   4. Passez en mode live quand prêt');
    
  } catch (error) {
    logResult('ERREUR DURANT LES TESTS', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data
      }
    }, true);
    
    console.log('\n🔧 Dépannage :');
    console.log('   - Vérifiez que le serveur backend est lancé');
    console.log('   - Vérifiez vos clés FedaPay dans .env');
    console.log('   - Vérifiez la connectivité internet');
    console.log('   - Consultez les logs du serveur backend');
  }
}

/**
 * Test des numéros de téléphone togolais
 */
async function testTogolanesePhoneNumbers() {
  console.log('\n📞 TEST DES NUMÉROS TOGOLAIS');
  console.log('=' .repeat(40));
  
  const testNumbers = [
    '90123456',      // Format local Flooz
    '70123456',      // Format local Tmoney
    '+22890123456',  // Format international Flooz
    '+22870123456',  // Format international Tmoney
    '22890123456',   // Format sans +
    '64000001',      // Numéro test FedaPay
    '64000000',      // Numéro test FedaPay (échec)
  ];
  
  for (const number of testNumbers) {
    try {
      const response = await axios.post(`${API_BASE_URL}/students/recharge`, {
        phone: number,
        amount: 500,
        network: 'AUTO'
      });
      
      console.log(`✅ ${number}: Format valide`);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      if (message.includes('Format de numéro')) {
        console.log(`❌ ${number}: ${message}`);
      } else {
        console.log(`⚠️ ${number}: Autre erreur - ${message}`);
      }
    }
  }
}

// ===== EXECUTION DES TESTS =====
async function runAllTests() {
  console.log('🧪 SUITE DE TESTS FEDAPAY UKBUS');
  console.log('================================');
  
  // Test des numéros de téléphone
  await testTogolanesePhoneNumbers();
  
  // Test complet d'intégration
  await testFedaPayIntegration();
}

// Lancer les tests si ce script est exécuté directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testFedaPayIntegration,
  testTogolanesePhoneNumbers,
  runAllTests
};
