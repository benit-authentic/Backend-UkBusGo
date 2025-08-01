/**
 * Test de webhook FedaPay avec signature correcte
 */

const crypto = require('crypto');
const axios = require('axios');

// Configuration
const WEBHOOK_URL = 'http://localhost:5000/api/fedapay/webhook';
const WEBHOOK_SECRET = 'wh_sandbox_6HOb6QuFVelNv7PdifZIpvsd'; // Votre clé secrète

/**
 * Génère une signature FedaPay valide
 */
function generateFedaPaySignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const stringToSign = `${timestamp}.${payloadString}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(stringToSign, 'utf8')
    .digest('hex');
  
  return {
    signature: `t=${timestamp},v1=${signature}`,
    timestamp,
    payload: payloadString
  };
}

/**
 * Test webhook avec signature valide
 */
async function testWebhookWithSignature() {
  console.log('🔐 Test webhook avec signature FedaPay...');
  
  const webhookPayload = {
    name: 'transaction.approved',
    entity: {
      id: 345628,
      reference: 'trx_4_A_1754069951395',
      merchant_reference: 'UKBUS-1754069951418-688cededd1cf96c5be4e49e4',
      amount: 1500,
      status: 'approved',
      custom_metadata: {
        student_id: '688cededd1cf96c5be4e49e4',
        service: 'ukbus_recharge',
        network: 'FLOOZ'
      }
    }
  };
  
  try {
    const { signature, payload } = generateFedaPaySignature(webhookPayload, WEBHOOK_SECRET);
    
    console.log('📝 Payload:', payload);
    console.log('🔑 Signature:', signature);
    
    const response = await axios.post(WEBHOOK_URL, webhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-FEDAPAY-SIGNATURE': signature
      }
    });
    
    console.log('✅ Webhook accepté !');
    console.log('📨 Réponse:', response.data);
    
  } catch (error) {
    console.log('❌ Erreur webhook:', error.response?.data || error.message);
  }
}

// Lancer le test
if (require.main === module) {
  testWebhookWithSignature();
}

module.exports = { testWebhookWithSignature };
