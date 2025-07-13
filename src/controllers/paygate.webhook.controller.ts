import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/transaction.model';
import { Student } from '../models/student.model';

/**
 * Webhook PayGate : confirmation paiement mobile
 * @route POST /api/paygate/webhook
 */
export const paygateWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, status, amount, phone_number } = req.body;
    if (!identifier || typeof status === 'undefined') {
      return res.status(400).json({ success: false, message: 'Payload invalide.' });
    }
    // Mettre à jour la transaction
    const transaction = await Transaction.findOneAndUpdate(
      { identifier },
      { status: status === 0 ? 'success' : 'failed' },
      { new: true },
    );
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction non trouvée.' });
    }
    // Si succès, créditer le solde étudiant
    if (status === 0) {
      await Student.findByIdAndUpdate(transaction.user, { $inc: { balance: amount } });
    }
    return res.status(200).json({ success: true, message: 'Webhook traité.' });
  } catch (err) {
    next(err);
  }
};
