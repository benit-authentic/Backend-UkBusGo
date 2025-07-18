import { Router } from 'express';
import { registerDriver, loginDriver, getDriverHistory, getDriverHistoryAll, getDriverProfile } from '../controllers/driver.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

/**
 * @swagger
 * /api/drivers/register:
 *   post:
 *     summary: Inscription chauffeur
 *     tags: [Drivers]
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
 *         description: Inscription chauffeur réussie
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
 *               message: "Inscription chauffeur réussie"
 */
router.post('/register', registerDriver);

/**
 * @swagger
 * /api/drivers/login:
 *   post:
 *     summary: Connexion chauffeur
 *     tags: [Drivers]
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
 *             phone: "8888888888"
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
 *                     driver:
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
 *                 driver:
 *                   id: "456"
 *                   firstName: "Jane"
 *                   lastName: "Smith"
 *                   phone: "8888888888"
 *               message: "Connexion réussie"
 */
router.post('/login', loginDriver);

/**
 * @swagger
 * /api/drivers/me:
 *   get:
 *     summary: Récupérer le profil du chauffeur connecté
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil chauffeur récupéré
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
 *               message: "Profil chauffeur récupéré"
 */
router.get('/me', requireAuth(['driver']), getDriverProfile);

/**
 * @swagger
 * /api/drivers/history:
 *   get:
 *     summary: Historique des validations du jour (protégé)
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique du jour récupéré
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
 *                       student:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           phone:
 *                             type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 - student:
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     phone: "900000000"
 *                   date: "2025-07-13T12:00:00Z"
 *               message: "Historique du jour récupéré"
 */
router.get('/history', requireAuth(['driver']), getDriverHistory);
router.get('/history/all', requireAuth(['driver']), getDriverHistoryAll);

export default router;
