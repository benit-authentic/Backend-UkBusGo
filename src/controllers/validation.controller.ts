import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/student.model';
import { Driver } from '../models/driver.model';
import { Validation } from '../models/validation.model';

/**
 * Validation d'un ticket par scan QR (chauffeur)
 * @route POST /api/validations/scan
 */
export const validateTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const driverId = req.user?.id;
    const { qrPayload } = req.body;
    if (!driverId || !qrPayload) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants.' });
    }
    let payload: { id: string; balance: number; ts: number };
    try {
      payload = typeof qrPayload === 'string' ? JSON.parse(qrPayload) : qrPayload;
    } catch {
      return res.status(400).json({ success: false, message: 'QR code invalide.' });
    }
    // Vérifier l'étudiant
    const student = await Student.findById(payload.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Étudiant non trouvé.' });
    }
    // Vérifier les tickets
    if (!student.tickets || student.tickets < 1) {
      await Validation.create({ student: student._id, driver: driverId, amount: 0, date: new Date(), isValid: false });
      return res.status(400).json({ success: false, message: 'Aucun ticket disponible.', isValid: false, tickets: student.tickets || 0 });
    }
    // Décrémenter les tickets et enregistrer la validation
    student.tickets -= 1;
    student.history.push({ type: 'validation', amount: 150, date: new Date() });
    await student.save();
    await Validation.create({ student: student._id, driver: driverId, amount: 150, date: new Date(), isValid: true });
    return res.status(200).json({ success: true, message: 'Ticket validé.', isValid: true, tickets: student.tickets, balance: student.balance });
  } catch (err) {
    next(err);
  }
};
