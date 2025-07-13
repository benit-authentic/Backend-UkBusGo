import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Admin } from '../models/admin.model';
import { adminRegisterSchema } from '../types/admin.schema';
import { driverRegisterSchema } from '../types/driver.schema';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { Student } from '../models/student.model';
import { Driver } from '../models/driver.model';
import { Transaction } from '../models/transaction.model';
import { Validation } from '../models/validation.model';

/**
 * Inscription d'un admin
 * @route POST /api/admins/register
 */
export const registerAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = adminRegisterSchema.parse(req.body);
    const existing = await Admin.findOne({ phone: data.phone }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Numéro déjà utilisé.' });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const admin = await Admin.create({
      ...data,
      password: hashedPassword,
    });
    return res.status(201).json({
      success: true,
      data: { id: admin._id, firstName: admin.firstName, lastName: admin.lastName, phone: admin.phone },
      message: 'Inscription admin réussie',
    });
  } catch (err) {
    next(err);
  }
};


/**
 * Connexion admin
 * @route POST /api/admins/login
 */
export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Téléphone et mot de passe requis.' });
    }
    const admin = await Admin.findOne({ phone });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }
    const accessToken = signAccessToken({ id: admin._id, role: 'admin' });
    const refreshToken = signRefreshToken({ id: admin._id, role: 'admin' });
    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          phone: admin.phone,
        },
      },
      message: 'Connexion réussie',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Dashboard admin : stats globales
 * @route GET /api/admins/dashboard
 */
export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [students, drivers, admins, transactions, validations] = await Promise.all([
      Student.countDocuments(),
      Driver.countDocuments(),
      Admin.countDocuments(),
      Transaction.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Validation.countDocuments({ date: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
    ]);
    return res.status(200).json({
      success: true,
      data: {
        students,
        drivers,
        admins,
        totalSales: transactions[0]?.total || 0,
        totalTransactions: transactions[0]?.count || 0,
        validationsToday: validations,
      },
      message: 'Statistiques dashboard',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Lister tous les chauffeurs
 * @route GET /api/admins/drivers
 */
export const listDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const drivers = await Driver.find().select('-password').lean();
    return res.status(200).json({ success: true, data: drivers, message: 'Liste des chauffeurs' });
  } catch (err) {
    next(err);
  }
};

/**
 * Ajouter un chauffeur
 * @route POST /api/admins/drivers
 */
export const addDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = driverRegisterSchema.parse(req.body);
    const existing = await Driver.findOne({ phone: data.phone }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Numéro déjà utilisé.' });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const driver = await Driver.create({ ...data, password: hashedPassword });
    return res.status(201).json({ success: true, data: { id: driver._id, firstName: driver.firstName, lastName: driver.lastName, phone: driver.phone }, message: 'Chauffeur ajouté' });
  } catch (err) {
    next(err);
  }
};

/**
 * Supprimer un chauffeur
 * @route DELETE /api/admins/drivers/:id
 */
export const deleteDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Chauffeur non trouvé.' });
    }
    return res.status(200).json({ success: true, message: 'Chauffeur supprimé' });
  } catch (err) {
    next(err);
  }
};
