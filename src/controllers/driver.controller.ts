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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const validations = await Validation.find({
      driver: driverId,
      date: { $gte: startOfDay },
    }).populate('student', 'firstName lastName phone').lean();
    return res.status(200).json({
      success: true,
      data: validations,
      message: 'Historique du jour récupéré',
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
