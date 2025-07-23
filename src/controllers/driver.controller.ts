import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Driver } from '../models/driver.model';
import { driverRegisterSchema } from '../types/driver.schema';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { Validation } from '../models/validation.model';
/**
 * Connexion chauffeur
 * @route POST /api/drivers/login
 */
export const loginDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Téléphone et mot de passe requis.' });
    }
    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }
    const valid = await bcrypt.compare(password, driver.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }
    const accessToken = signAccessToken({ id: driver._id, role: 'driver' });
    const refreshToken = signRefreshToken({ id: driver._id, role: 'driver' });
    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        driver: {
          id: driver._id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          phone: driver.phone,
        },
      },
      message: 'Connexion réussie',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer l'historique des validations du chauffeur (aujourd'hui)
 * @route GET /api/drivers/history
 */
export const getDriverHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const driverId = req.user?.id;
    if (!driverId) {
      return res.status(400).json({ success: false, message: 'Utilisateur non authentifié.' });
    }

    // Si une date est fournie en query parameter, l'utiliser, sinon prendre aujourd'hui
    const { date } = req.query;
    let targetDate: Date;
    
    if (date && typeof date === 'string') {
      // Format attendu: YYYY-MM-DD
      // Créer la date en forçant la timezone locale pour éviter les décalages UTC
      const [year, month, day] = date.split('-').map(Number);
      targetDate = new Date(year, month - 1, day); // month est 0-indexé en JS
      
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Format de date invalide. Utilisez YYYY-MM-DD.' });
      }
      
      console.log(`📅 Date reçue: ${date}`);
      console.log(`📅 Date parsée: ${targetDate.toISOString()}`);
      console.log(`📅 Date locale: ${targetDate.toLocaleDateString()}`);
    } else {
      // Par défaut: aujourd'hui
      targetDate = new Date();
    }

    // Créer les bornes de la journée (00:00:00 à 23:59:59)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`🕐 Période recherchée: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`);

    const validations = await Validation.find({
      driver: driverId,
      date: { 
        $gte: startOfDay,
        $lte: endOfDay
      },
    })
    .populate('student', 'firstName lastName phone')
    .sort({ date: -1 })
    .lean();

    console.log(`📊 ${validations.length} validations trouvées pour la période`);
    if (validations.length > 0) {
      console.log(`📅 Première validation: ${validations[0].date}`);
      console.log(`📅 Dernière validation: ${validations[validations.length - 1].date}`);
    }

    return res.status(200).json({
      success: true,
      data: validations,
      message: date ? `Historique du ${date} récupéré` : 'Historique du jour récupéré',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer l'historique complet des validations du chauffeur
 * @route GET /api/drivers/history/all
 */
export const getDriverHistoryAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const driverId = req.user?.id;
    if (!driverId) {
      return res.status(400).json({ success: false, message: 'Utilisateur non authentifié.' });
    }
    
    // Récupérer toutes les validations du chauffeur, triées par date décroissante
    const validations = await Validation.find({
      driver: driverId,
    })
    .populate('student', 'firstName lastName phone')
    .sort({ date: -1 })
    .lean();
    
    return res.status(200).json({
      success: true,
      data: validations,
      message: 'Historique complet récupéré',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Inscription d'un chauffeur
 * @route POST /api/drivers/register
 */
export const registerDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = driverRegisterSchema.parse(req.body);
    const existing = await Driver.findOne({ phone: data.phone }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Numéro déjà utilisé.' });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const driver = await Driver.create({
      ...data,
      password: hashedPassword,
    });
    return res.status(201).json({
      success: true,
      data: { id: driver._id, firstName: driver.firstName, lastName: driver.lastName, phone: driver.phone },
      message: 'Inscription chauffeur réussie',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer le profil du chauffeur connecté
 * @route GET /api/drivers/me
 * @access Auth (chauffeur)
 * @returns { success: true, data: { id, firstName, lastName, phone }, message }
 */
export const getDriverProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Utilisateur non authentifié.' });
    }
    const driver = await Driver.findById(userId).lean();
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Chauffeur introuvable.' });
    }
    return res.status(200).json({
      success: true,
      data: {
        id: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
      },
      message: 'Profil chauffeur récupéré',
    });
  } catch (err) {
    next(err);
  }
};
