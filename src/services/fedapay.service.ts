import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { formatForFedaPay } from '../utils/phone.utils';

// Configuration FedaPay
const FEDAPAY_API_KEY = process.env.FEDAPAY_API_KEY || 'sk_sandbox_ILJZ8BkLdyUilxRB8FMG66cR';
const FEDAPAY_PUBLIC_KEY = process.env.FEDAPAY_PUBLIC_KEY || 'pk_sandbox_AwJipFnOfIlJkJ6ppa4Wk9ib';
const FEDAPAY_ENVIRONMENT = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';
const FEDAPAY_BASE_URL = FEDAPAY_ENVIRONMENT === 'live' 
  ? 'https://api.fedapay.com/v1' 
  : 'https://sandbox-api.fedapay.com/v1';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://votre-domaine.com/api/fedapay/webhook';

/**
 * Interface pour initialiser un paiement FedaPay
 */
export interface FedaPayInitParams {
  phone_number: string;
  amount: number;
  network?: 'FLOOZ' | 'TMONEY'; // Optionnel, utilisateur peut choisir ou FedaPay auto-détecte
  description?: string;
  student_id: string; // ID de l'étudiant pour traçabilité
}

/**
 * Interface pour la réponse de création de transaction FedaPay
 */
export interface FedaPayTransaction {
  transaction_id: number;
  reference: string;
  amount: number;
  status: string;
  payment_url?: string;
  merchant_reference: string;
}

/**
 * Interface pour vérifier le statut d'une transaction
 */
export interface FedaPayStatusParams {
  transaction_id: number;
}

/**
 * Initialise un paiement FedaPay (remplace initiatePaygatePayment)
 */
export const initiateFedaPayPayment = async (params: FedaPayInitParams): Promise<FedaPayTransaction> => {
  try {
    // Générer une référence unique pour votre système
    const merchantReference = `UKBUS-${Date.now()}-${params.student_id}`;
    
    // Construire les données de la transaction
    const transactionData = {
      description: params.description || 'Recharge tickets UkBus',
      amount: params.amount, // Montant en francs CFA (nombre entier)
      currency: { iso: 'XOF' }, // Franc CFA
      callback_url: WEBHOOK_URL,
      merchant_reference: merchantReference,
      
      // Informations client (optionnel mais recommandé)
      customer: {
        firstname: 'Étudiant',
        lastname: 'UkBus',
        email: `etudiant-${params.student_id}@ukbus.tg`,
        phone_number: formatForFedaPay(params.phone_number) // Format correct pour FedaPay
      },
      
      // Métadonnées personnalisées pour traçabilité
      custom_metadata: {
        student_id: params.student_id,
        service: 'ukbus_recharge',
        network: params.network || 'auto_detect'
      }
    };

    // Appel API FedaPay pour créer la transaction
    const response = await axios.post(`${FEDAPAY_BASE_URL}/transactions`, transactionData, {
      headers: {
        'Authorization': `Bearer ${FEDAPAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const transaction = response.data['v1/transaction'];
    
    return {
      transaction_id: transaction.id,
      reference: transaction.reference,
      amount: transaction.amount,
      status: transaction.status,
      merchant_reference: merchantReference
    };

  } catch (error: any) {
    console.error('Erreur FedaPay initiation:', error.response?.data || error.message);
    throw new Error(`Échec initiation paiement FedaPay: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Déclenche un paiement mobile sans redirection (remplace l'ancien système PayGate)
 */
export const sendMobilePayment = async (transactionId: number, phoneNumber: string, network?: string): Promise<any> => {
  try {
    // D'abord, générer le token de paiement
    const tokenResponse = await axios.post(`${FEDAPAY_BASE_URL}/transactions/${transactionId}/token`, {}, {
      headers: {
        'Authorization': `Bearer ${FEDAPAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const token = tokenResponse.data.token;

    // Laisser FedaPay auto-détecter le réseau ou utiliser le réseau spécifié
    // Utilisation de 'mtn_open' comme méthode générique qui fonctionne pour tous les opérateurs au Togo
    let paymentMethod = 'mtn_open'; // Méthode générique compatible avec Flooz et Tmoney
    
    // Si l'utilisateur a spécifié un réseau, on peut l'utiliser (optionnel)
    if (network === 'FLOOZ') {
      paymentMethod = 'moov_togo'; // Spécifique à Flooz si désiré
    } else if (network === 'TMONEY') {
      paymentMethod = 'togocom'; // Spécifique à Mixx by Yas si désiré
    }
    // Sinon, on garde 'mtn_open' qui fonctionne pour tous

    // Envoyer la notification de paiement mobile
    const paymentResponse = await axios.post(`${FEDAPAY_BASE_URL}/${paymentMethod}`, {
      token: token,
      phone_number: formatForFedaPay(phoneNumber) // Format correct pour FedaPay
    }, {
      headers: {
        'Authorization': `Bearer ${FEDAPAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return paymentResponse.data;

  } catch (error: any) {
    console.error('Erreur envoi paiement mobile:', error.response?.data || error.message);
    throw new Error(`Échec envoi paiement mobile: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Vérifie le statut d'une transaction FedaPay (remplace checkPaygateStatus)
 */
export const checkFedaPayStatus = async (params: FedaPayStatusParams): Promise<any> => {
  try {
    const response = await axios.get(`${FEDAPAY_BASE_URL}/transactions/${params.transaction_id}`, {
      headers: {
        'Authorization': `Bearer ${FEDAPAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const transaction = response.data['v1/transaction'];
    
    return {
      id: transaction.id,
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      merchant_reference: transaction.merchant_reference,
      custom_metadata: transaction.custom_metadata
    };

  } catch (error: any) {
    console.error('Erreur vérification statut FedaPay:', error.response?.data || error.message);
    throw new Error(`Échec vérification statut: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Récupère une transaction par référence marchand
 */
export const getTransactionByMerchantReference = async (merchantReference: string): Promise<any> => {
  try {
    const response = await axios.get(`${FEDAPAY_BASE_URL}/transactions/merchant/${merchantReference}`, {
      headers: {
        'Authorization': `Bearer ${FEDAPAY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data['v1/transaction'];

  } catch (error: any) {
    console.error('Erreur récupération par référence:', error.response?.data || error.message);
    throw new Error(`Transaction non trouvée: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Utilitaires de conversion de statut
 */
export const mapFedaPayStatusToInternal = (fedaPayStatus: string): 'pending' | 'success' | 'failed' => {
  switch (fedaPayStatus) {
    case 'approved':
    case 'transferred':
      return 'success';
    case 'canceled':
    case 'declined':
    case 'expired':
      return 'failed';
    case 'pending':
    default:
      return 'pending';
  }
};
