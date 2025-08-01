import { Request, Response, NextFunction } from 'express';
import { checkPaygateStatus } from '../services/paygate.service';
import { checkFedaPayStatus, mapFedaPayStatusToInternal } from '../services/fedapay.service';
import { Transaction } from '../models/transaction.model';

/**
 * Vérifier le statut d'une transaction
 * @route GET /api/transactions/:identifier/status
 */
export const getTransactionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Identifiant requis.' });
    }
    
    // Vérifier que la transaction existe
    const transaction = await Transaction.findOne({ identifier });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction non trouvée.' });
    }
    
    let status;
    
    // Vérifier selon la méthode de paiement
    if (transaction.payment_method === 'fedapay' && transaction.fedapay_transaction_id) {
      // Utiliser FedaPay pour vérifier le statut
      try {
        const fedaPayStatus = await checkFedaPayStatus({ 
          transaction_id: transaction.fedapay_transaction_id 
        });
        
        // Mettre à jour le statut local si différent
        const internalStatus = mapFedaPayStatusToInternal(fedaPayStatus.status);
        if (transaction.status !== internalStatus) {
          transaction.status = internalStatus;
          await transaction.save();
        }
        
        status = {
          transaction_id: fedaPayStatus.id,
          reference: fedaPayStatus.reference,
          status: fedaPayStatus.status,
          internal_status: internalStatus,
          amount: fedaPayStatus.amount,
          merchant_reference: fedaPayStatus.merchant_reference
        };
        
      } catch (fedaPayError) {
        console.error('Erreur vérification FedaPay, utilisation du statut local:', fedaPayError);
        status = {
          internal_status: transaction.status,
          amount: transaction.amount,
          source: 'local'
        };
      }
      
    } else {
      // Fallback vers PayGate pour les anciennes transactions
      try {
        status = await checkPaygateStatus({ identifier });
      } catch (paygateError) {
        console.error('Erreur vérification PayGate, utilisation du statut local:', paygateError);
        status = {
          internal_status: transaction.status,
          amount: transaction.amount,
          source: 'local'
        };
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      data: {
        ...status,
        local_transaction: {
          id: transaction._id,
          identifier: transaction.identifier,
          status: transaction.status,
          amount: transaction.amount,
          type: transaction.type,
          network: transaction.network,
          payment_method: transaction.payment_method,
          created_at: transaction.createdAt
        }
      }
    });
    
  } catch (err) {
    next(err);
  }
};
