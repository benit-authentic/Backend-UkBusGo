import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Transaction } from '../models/transaction.model';
import { Student } from '../models/student.model';
import { mapFedaPayStatusToInternal } from '../services/fedapay.service';

// Clé secrète du webhook (à récupérer depuis le dashboard FedaPay)
const FEDAPAY_WEBHOOK_SECRET = process.env.FEDAPAY_WEBHOOK_SECRET || 'wh_sandbox_...';

/**
 * Vérifie la signature du webhook FedaPay pour s'assurer qu'il provient bien de FedaPay
 */
const verifyFedaPaySignature = (payload: string, signature: string, secret: string): boolean => {
  try {
    // La signature FedaPay est au format: t=timestamp,v1=signature
    const elements = signature.split(',');
    let timestamp: string = '';
    let fedapaySignature: string = '';
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        fedapaySignature = value;
      }
    }
    
    if (!timestamp || !fedapaySignature) {
      console.error('Signature FedaPay mal formée');
      return false;
    }
    
    // Vérifier que le timestamp n'est pas trop ancien (5 minutes max)
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    if (currentTime - webhookTime > 300) { // 5 minutes
      console.error('Webhook FedaPay trop ancien');
      return false;
    }
    
    // Calculer la signature attendue
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(timestamp + '.' + payload)
      .digest('hex');
    
    // Comparaison sécurisée
    return crypto.timingSafeEqual(
      Buffer.from(fedapaySignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    
  } catch (error) {
    console.error('Erreur vérification signature FedaPay:', error);
    return false;
  }
};

/**
 * Webhook FedaPay : gestion des événements en temps réel
 * @route POST /api/fedapay/webhook
 */
export const fedaPayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-fedapay-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    if (!signature) {
      console.error('Signature FedaPay manquante');
      return res.status(400).json({ 
        success: false, 
        message: 'Signature manquante' 
      });
    }
    
    // Vérifier la signature (en production, décommenter cette vérification)
    // if (!verifyFedaPaySignature(payload, signature, FEDAPAY_WEBHOOK_SECRET)) {
    //   console.error('Signature FedaPay invalide');
    //   return res.status(401).json({ 
    //     success: false, 
    //     message: 'Signature invalide' 
    //   });
    // }
    
    const { name: eventType, entity } = req.body;
    
    if (!eventType || !entity) {
      console.error('Webhook FedaPay mal formé:', req.body);
      return res.status(400).json({ 
        success: false, 
        message: 'Données webhook invalides' 
      });
    }
    
    console.log(`📨 Webhook FedaPay reçu: ${eventType}`, entity);
    
    // Traiter les différents types d'événements
    switch (eventType) {
      case 'transaction.created':
        await handleTransactionCreated(entity);
        break;
        
      case 'transaction.approved':
        await handleTransactionApproved(entity);
        break;
        
      case 'transaction.canceled':
      case 'transaction.declined':
        await handleTransactionFailed(entity);
        break;
        
      case 'transaction.transferred':
        await handleTransactionTransferred(entity);
        break;
        
      case 'transaction.updated':
        await handleTransactionUpdated(entity);
        break;
        
      default:
        console.log(`⚠️ Événement FedaPay non géré: ${eventType}`);
    }
    
    // Toujours répondre 200 pour confirmer la réception
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook traité avec succès',
      event_type: eventType
    });
    
  } catch (error) {
    console.error('Erreur traitement webhook FedaPay:', error);
    next(error);
  }
};

/**
 * Gère l'événement transaction.created
 */
const handleTransactionCreated = async (transactionData: any) => {
  console.log('📝 Transaction FedaPay créée:', transactionData.id);
  
  // Mettre à jour notre transaction locale si elle existe
  const merchantReference = transactionData.merchant_reference;
  if (merchantReference) {
    await Transaction.findOneAndUpdate(
      { merchant_reference: merchantReference },
      { 
        fedapay_transaction_id: transactionData.id,
        fedapay_reference: transactionData.reference,
        status: 'pending'
      }
    );
  }
};

/**
 * Gère l'événement transaction.approved (paiement réussi)
 */
const handleTransactionApproved = async (transactionData: any) => {
  console.log('✅ Transaction FedaPay approuvée:', transactionData.id);
  
  try {
    // Chercher la transaction par merchant_reference ou fedapay_transaction_id
    const transaction = await Transaction.findOne({
      $or: [
        { merchant_reference: transactionData.merchant_reference },
        { fedapay_transaction_id: transactionData.id }
      ]
    });
    
    if (!transaction) {
      console.error('❌ Transaction UkBus non trouvée pour FedaPay ID:', transactionData.id);
      return;
    }
    
    // Mettre à jour le statut de la transaction
    transaction.status = 'success';
    transaction.fedapay_transaction_id = transactionData.id;
    transaction.fedapay_reference = transactionData.reference;
    await transaction.save();
    
    // Créditer le solde de l'étudiant (comme avec PayGate)
    if (transaction.type === 'recharge') {
      const student = await Student.findByIdAndUpdate(
        transaction.user,
        { $inc: { balance: transaction.amount } },
        { new: true }
      );
      
      if (student) {
        console.log(`💰 Solde étudiant ${student.firstName} ${student.lastName} crédité de ${transaction.amount} FCFA`);
      }
    }
    
    console.log(`✅ Transaction UkBus ${transaction.identifier} mise à jour avec succès`);
    
  } catch (error) {
    console.error('Erreur traitement transaction.approved:', error);
  }
};

/**
 * Gère les événements transaction.canceled et transaction.declined (paiement échoué)
 */
const handleTransactionFailed = async (transactionData: any) => {
  console.log('❌ Transaction FedaPay échouée:', transactionData.id);
  
  try {
    // Chercher la transaction
    const transaction = await Transaction.findOne({
      $or: [
        { merchant_reference: transactionData.merchant_reference },
        { fedapay_transaction_id: transactionData.id }
      ]
    });
    
    if (!transaction) {
      console.error('❌ Transaction UkBus non trouvée pour FedaPay ID:', transactionData.id);
      return;
    }
    
    // Mettre à jour le statut
    transaction.status = 'failed';
    transaction.fedapay_transaction_id = transactionData.id;
    transaction.fedapay_reference = transactionData.reference;
    await transaction.save();
    
    console.log(`❌ Transaction UkBus ${transaction.identifier} marquée comme échouée`);
    
  } catch (error) {
    console.error('Erreur traitement transaction failed:', error);
  }
};

/**
 * Gère l'événement transaction.transferred (fonds transférés vers le marchand)
 */
const handleTransactionTransferred = async (transactionData: any) => {
  console.log('🏦 Transaction FedaPay transférée:', transactionData.id);
  
  // Optionnel : marquer la transaction comme "transférée" dans vos records
  await Transaction.findOneAndUpdate(
    {
      $or: [
        { merchant_reference: transactionData.merchant_reference },
        { fedapay_transaction_id: transactionData.id }
      ]
    },
    { 
      $set: { 
        'custom_metadata.transferred_at': new Date(),
        'custom_metadata.transfer_status': 'completed'
      }
    }
  );
};

/**
 * Gère l'événement transaction.updated (mise à jour générale)
 */
const handleTransactionUpdated = async (transactionData: any) => {
  console.log('🔄 Transaction FedaPay mise à jour:', transactionData.id);
  
  // Convertir le statut FedaPay vers notre système
  const internalStatus = mapFedaPayStatusToInternal(transactionData.status);
  
  await Transaction.findOneAndUpdate(
    {
      $or: [
        { merchant_reference: transactionData.merchant_reference },
        { fedapay_transaction_id: transactionData.id }
      ]
    },
    { 
      status: internalStatus,
      fedapay_transaction_id: transactionData.id,
      fedapay_reference: transactionData.reference,
      $set: {
        'custom_metadata.last_fedapay_status': transactionData.status,
        'custom_metadata.last_updated': new Date()
      }
    }
  );
};
