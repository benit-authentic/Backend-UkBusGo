import { Router } from 'express';
import { registerStudent, loginStudent, rechargeStudent, buyTicket, getStudentHistory, getStudentProfile } from '../controllers/student.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

/**
 * @swagger
 * /api/students/register:
 *   post:
 *     summary: Inscription étudiant
 *     tags: [Students]
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
 *             firstName: "John"
 *             lastName: "Doe"
 *             phone: "900000000"
 *             password: "password123"
 *     responses:
 *       201:
 *         description: Inscription réussie
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
 *                 id: "123"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 phone: "900000000"
 *               message: "Inscription réussie"
 */
router.post('/register', registerStudent);

/**
 * @swagger
 * /api/students/login:
 *   post:
 *     summary: Connexion étudiant
 *     tags: [Students]
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
 *             phone: "900000000"
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
 *                     student:
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
 *                 student:
 *                   id: "123"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   phone: "900000000"
 *               message: "Connexion réussie"
 */
router.post('/login', loginStudent);

/**
 * @swagger
 * /api/students/recharge:
 *   post:
 *     summary: Recharger le solde
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               amount:
 *                 type: number
 *               network:
 *                 type: string
 *                 enum: [FLOOZ, TMONEY]
 *           example:
 *             phone: "900000000"
 *             amount: 1000
 *             network: "FLOOZ"
 *     responses:
 *       200:
 *         description: Recharge initiée
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
 *                     txReference:
 *                       type: string
 *                     identifier:
 *                       type: string
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 txReference: "ref123"
 *                 identifier: "id456"
 *               message: "Paiement initié, validez sur votre mobile."
 */
router.post('/recharge', rechargeStudent);

/**
 * @swagger
 * /api/students/buy-ticket:
 *   post:
 *     summary: Acheter un ou plusieurs tickets (protégé)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 default: 1
 *           example:
 *             quantity: 2
 *     responses:
 *       200:
 *         description: Ticket(s) acheté(s)
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
 *                     qr:
 *                       type: string
 *                       description: QR code base64
 *                     balance:
 *                       type: number
 *                     lowBalance:
 *                       type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 qr: "qrcode_base64"
 *                 balance: 350
 *                 lowBalance: false
 *               message: "Ticket(s) acheté(s) avec succès"
 */
router.post('/buy-ticket', requireAuth(['student']), buyTicket);

/**
 * @swagger
 * /api/students/history:
 *   get:
 *     summary: Historique étudiant (protégé)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique récupéré
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
 *                       type:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 - type: "purchase"
 *                   amount: 500
 *                   date: "2025-07-13T12:00:00Z"
 *               message: "Historique récupéré"
 */
router.get('/history', requireAuth(['student']), getStudentHistory);

/**
 * @swagger
 * /api/students/me:
 *   get:
 *     summary: Récupérer le profil de l'étudiant connecté (inclut le solde)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil étudiant récupéré
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
 *                     balance:
 *                       type: number
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 id: "123"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 phone: "900000000"
 *                 balance: 1200
 *               message: "Profil étudiant récupéré"
 */
router.get('/me', requireAuth(['student']), getStudentProfile);

export default router;
