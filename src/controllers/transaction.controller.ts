import { Request, Response, NextFunction } from 'express';
import { checkPaygateStatus } from '../services/paygate.service';
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
    // Vérifier le statut via PayGate
    const status = await checkPaygateStatus({ identifier });
    return res.status(200).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};
