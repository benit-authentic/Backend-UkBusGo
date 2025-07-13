import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Student } from '../models/student.model';
import { studentRegisterSchema } from '../types/student.schema';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { initiatePaygatePayment } from '../services/paygate.service';
import { Transaction } from '../models/transaction.model';
import QRCode from 'qrcode';
import { Validation } from '../models/validation.model';
/**
 * Connexion étudiant
 * @route POST /api/students/login
 */
export const loginStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Téléphone et mot de passe requis.' });
    }
    const student = await Student.findOne({ phone });
    if (!student) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }
    const valid = await bcrypt.compare(password, student.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }
    const accessToken = signAccessToken({ id: student._id, role: 'student' });
    const refreshToken = signRefreshToken({ id: student._id, role: 'student' });
    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        student: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          phone: student.phone,
        },
      },
      message: 'Connexion réussie',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Initier une recharge de compte étudiant
 * @route POST /api/students/recharge
 */
export const rechargeStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, amount, network } = req.body;
    if (!phone || !amount || !network) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants.' });
    }
    // Vérifier que l'étudiant existe
    const student = await Student.findOne({ phone });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Étudiant introuvable.' });
    }
    // Initier paiement PayGate
    const paygateRes = await initiatePaygatePayment({ phone_number: phone, amount, network });
    // Créer la transaction en base
    await Transaction.create({
      user: student._id,
      type: 'recharge',
      amount,
      status: 'pending',
      identifier: paygateRes.identifier,
      txReference: paygateRes.tx_reference,
      network,
    });
    return res.status(200).json({
      success: true,
      data: { txReference: paygateRes.tx_reference, identifier: paygateRes.identifier },
      message: 'Paiement initié, validez sur votre mobile.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Achat de ticket(s) par un étudiant
 * @route POST /api/students/buy-ticket
 */
export const buyTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { quantity = 1 } = req.body;
    if (!userId || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Paramètres invalides.' });
    }
    const TICKET_PRICE = 150;
    const total = TICKET_PRICE * quantity;
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Étudiant introuvable.' });
    }
    if (student.balance < total) {
      return res.status(400).json({ success: false, message: 'Solde insuffisant.' });
    }
    // Décrémenter le solde et ajouter à l'historique
    student.balance -= total;
    student.history.push({ type: 'purchase', amount: total, date: new Date() });
    await student.save();
    // Générer le QR code dynamique (solde, id, timestamp)
    const qrPayload = {
      id: student._id,
      balance: student.balance,
      ts: Date.now(),
    };
    const qr = await QRCode.toDataURL(JSON.stringify(qrPayload));
    const LOW_BALANCE_THRESHOLD = 300;
    const lowBalance = student.balance < LOW_BALANCE_THRESHOLD;
    return res.status(200).json({
      success: true,
      data: { qr, balance: student.balance, lowBalance },
      message: lowBalance
        ? "Ticket(s) acheté(s) avec succès. Attention, votre solde est faible."
        : 'Ticket(s) acheté(s) avec succès',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer l'historique d'un étudiant (achats, validations)
 * @route GET /api/students/history
 */
export const getStudentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Utilisateur non authentifié.' });
    }
    const student = await Student.findById(userId).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Étudiant introuvable.' });
    }
    const validations = await Validation.find({ student: userId }).populate('driver', 'firstName lastName').lean();
    return res.status(200).json({
      success: true,
      data: {
        purchases: student.history.filter((h: any) => h.type === 'purchase'),
        validations,
      },
      message: 'Historique récupéré',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Inscription d'un étudiant
 * @route POST /api/students/register
 */
export const registerStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = studentRegisterSchema.parse(req.body);
    const existing = await Student.findOne({ phone: data.phone }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Numéro déjà utilisé.' });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const student = await Student.create({
      ...data,
      password: hashedPassword,
      balance: 0,
      history: [],
    });
    return res.status(201).json({
      success: true,
      data: { id: student._id, firstName: student.firstName, lastName: student.lastName, phone: student.phone },
      message: 'Inscription réussie',
    });
  } catch (err) {
    next(err);
  }
};
