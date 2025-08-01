import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Student } from '../models/student.model';
import { studentRegisterSchema } from '../types/student.schema';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { initiateFedaPayPayment, sendMobilePayment } from '../services/fedapay.service';
import { validateTogolanesePhoneNumber, normalizeTogolanesePhoneNumber } from '../utils/phone.utils';
// Garde PayGate pour compatibilité avec les anciennes transactions
import { initiatePaygatePayment } from '../services/paygate.service';
import { Transaction } from '../models/transaction.model';
import QRCode from 'qrcode';
import { Validation } from '../models/validation.model';
import { v4 as uuidv4 } from 'uuid';
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
 * Récupérer le profil de l'étudiant connecté (inclut le solde)
 * @route GET /api/students/me
 * @access Auth (étudiant)
 * @returns { success: true, data: { id, firstName, lastName, phone, balance }, message }
 */
export const getStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
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
    return res.status(200).json({
      success: true,
      data: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        balance: student.balance,
        tickets: student.tickets || 0,
      },
      message: 'Profil étudiant récupéré',
    });
  } catch (err) {
    next(err);
  }
};


/**
 * Initier une recharge de compte étudiant avec FedaPay
 * @route POST /api/students/recharge
 */
export const rechargeStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, amount, network } = req.body;
    
    if (!phone || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Numéro de téléphone et montant requis.' 
      });
    }
    
    // Validation du numéro de téléphone togolais
    if (!validateTogolanesePhoneNumber(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format de numéro de téléphone togolais invalide. Utilisez le format: 90123456 ou +22890123456' 
      });
    }
    
    // Normaliser le numéro
    const normalizedPhone = normalizeTogolanesePhoneNumber(phone);
    
    // Vérifier que l'étudiant existe
    const student = await Student.findOne({ phone: normalizedPhone });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant introuvable avec ce numéro de téléphone.' 
      });
    }
    
    // Vérifier le montant minimum (ex: 100 FCFA)
    if (amount < 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Montant minimum de recharge: 100 FCFA' 
      });
    }
    
    try {
      // Générer un identifiant unique pour notre système
      const identifier = uuidv4();
      
      // Initier le paiement FedaPay (laisser FedaPay auto-détecter le réseau)
      const fedaPayResponse = await initiateFedaPayPayment({
        phone_number: normalizedPhone,
        amount: amount,
        network: network as 'FLOOZ' | 'TMONEY' | undefined, // Utiliser le réseau spécifié ou undefined pour auto-détection
        description: `Recharge UkBus - ${student.firstName} ${student.lastName}`,
        student_id: (student._id as unknown as string)
      });
      
      // Créer la transaction en base de données
      const transaction = await Transaction.create({
        user: student._id,
        type: 'recharge',
        amount: amount,
        status: 'pending',
        identifier: identifier,
        
        // Données FedaPay
        fedapay_transaction_id: fedaPayResponse.transaction_id,
        fedapay_reference: fedaPayResponse.reference,
        merchant_reference: fedaPayResponse.merchant_reference,
        
        network: network || 'auto_detect',
        payment_method: 'fedapay',
        
        custom_metadata: {
          student_id: (student._id as any).toString(),
          service: 'ukbus_recharge',
          network: network || 'auto_detect',
          phone_number: normalizedPhone
        }
      });
      
      // Déclencher le paiement mobile (notification push sur le téléphone)
      try {
        await sendMobilePayment(fedaPayResponse.transaction_id, normalizedPhone, network);
        console.log(`📱 Notification de paiement envoyée à ${normalizedPhone}`);
      } catch (mobileError) {
        console.error('Erreur envoi notification mobile:', mobileError);
        // Ne pas échouer la transaction pour cette erreur
      }
      
      return res.status(200).json({
        success: true,
        data: {
          transaction_id: transaction._id,
          identifier: identifier,
          fedapay_transaction_id: fedaPayResponse.transaction_id,
          fedapay_reference: fedaPayResponse.reference,
          amount: amount,
          network: network || 'auto_detect',
          status: 'pending'
        },
        message: 'Paiement initié avec FedaPay. Vérifiez votre téléphone pour valider la transaction.'
      });
      
    } catch (fedaPayError: any) {
      console.error('Erreur FedaPay, fallback vers PayGate:', fedaPayError);
      
      // Fallback vers PayGate en cas d'erreur FedaPay
      try {
        const paygateRes = await initiatePaygatePayment({ 
          phone_number: normalizedPhone, 
          amount, 
          network: network as 'FLOOZ' | 'TMONEY' || 'FLOOZ' 
        });
        
        // Créer la transaction avec PayGate
        const transaction = await Transaction.create({
          user: student._id,
          type: 'recharge',
          amount,
          status: 'pending',
          identifier: paygateRes.identifier,
          txReference: paygateRes.tx_reference,
          network: network || 'FLOOZ',
          payment_method: 'paygate'
        });
        
        return res.status(200).json({
          success: true,
          data: { 
            txReference: paygateRes.tx_reference, 
            identifier: paygateRes.identifier,
            payment_method: 'paygate'
          },
          message: 'Paiement initié via PayGate. Validez sur votre mobile.'
        });
        
      } catch (paygateError) {
        throw new Error(`Échec des deux systèmes de paiement. FedaPay: ${fedaPayError.message}, PayGate: ${paygateError}`);
      }
    }
    
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
    // Décrémenter le solde, incrémenter les tickets et ajouter à l'historique
    student.balance -= total;
    student.tickets = (student.tickets || 0) + quantity;
    student.history.push({ type: 'purchase', amount: total, date: new Date() });
    await student.save();
    // Générer le QR code dynamique (tickets, solde, id, timestamp)
    const qrPayload = {
      id: student._id,
      balance: student.balance,
      tickets: student.tickets,
      ts: Date.now(),
    };
    const qr = await QRCode.toDataURL(JSON.stringify(qrPayload));
    const LOW_BALANCE_THRESHOLD = 300;
    const lowBalance = student.balance < LOW_BALANCE_THRESHOLD;
    return res.status(200).json({
      success: true,
      data: { qr, balance: student.balance, tickets: student.tickets, lowBalance },
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
      tickets: 0,
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
