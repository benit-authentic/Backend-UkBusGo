import { Router } from 'express';
import { registerAdmin, loginAdmin, getAdminDashboard, listDrivers, addDriver, deleteDriver } from '../controllers/admin.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

/**
 * @swagger
 * /api/admins/register:
 *   post:
 *     summary: Inscription admin
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             firstName: "Admin"
 *             lastName: "Root"
 *             phone: "7777777777"
 *             password: "password123"
 *     responses:
 *       201:
 *         description: Inscription admin réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 id: "789"
 *                 firstName: "Admin"
 *                 lastName: "Root"
 *                 phone: "7777777777"
 *               message: "Inscription admin réussie"
 */
router.post('/register', registerAdmin);

/**
 * @swagger
 * /api/admins/login:
 *   post:
 *     summary: Connexion admin
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             phone: "7777777777"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         phone:
 *                           type: string
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 accessToken: "jwt..."
 *                 refreshToken: "jwt..."
 *                 admin:
 *                   id: "789"
 *                   firstName: "Admin"
 *                   lastName: "Root"
 *                   phone: "7777777777"
 *               message: "Connexion réussie"
 */
router.post('/login', loginAdmin);

/**
 * @swagger
 * /api/admins/dashboard:
 *   get:
 *     summary: Statistiques globales (protégé)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: number
 *                     drivers:
 *                       type: number
 *                     admins:
 *                       type: number
 *                     totalSales:
 *                       type: number
 *                     totalTransactions:
 *                       type: number
 *                     validationsToday:
 *                       type: number
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 students: 100
 *                 drivers: 20
 *                 admins: 2
 *                 totalSales: 10000
 *                 totalTransactions: 200
 *                 validationsToday: 15
 *               message: "Statistiques dashboard"
 */
router.get('/dashboard', requireAuth(['admin']), getAdminDashboard);

/**
 * @swagger
 * /api/admins/drivers:
 *   get:
 *     summary: Lister tous les chauffeurs (protégé)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des chauffeurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       phone:
 *                         type: string
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 - id: "456"
 *                   firstName: "Jane"
 *                   lastName: "Smith"
 *                   phone: "8888888888"
 *               message: "Liste des chauffeurs"
 */
router.get('/drivers', requireAuth(['admin']), listDrivers);

/**
 * @swagger
 * /api/admins/drivers:
 *   post:
 *     summary: Ajouter un chauffeur (protégé)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             firstName: "Jane"
 *             lastName: "Smith"
 *             phone: "8888888888"
 *             password: "password123"
 *     responses:
 *       201:
 *         description: Chauffeur ajouté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 id: "456"
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 phone: "8888888888"
 *               message: "Chauffeur ajouté"
 */
router.post('/drivers', requireAuth(['admin']), addDriver);

/**
 * @swagger
 * /api/admins/drivers/{id}:
 *   delete:
 *     summary: Supprimer un chauffeur (protégé)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chauffeur supprimé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               message: "Chauffeur supprimé"
 */
router.delete('/drivers/:id', requireAuth(['admin']), deleteDriver);

export default router;
