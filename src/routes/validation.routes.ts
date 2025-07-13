import { Router } from 'express';
import { validateTicket } from '../controllers/validation.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

/**
 * @swagger
 * /api/validations:
 *   post:
 *     summary: Valider un ticket (scan QR code)
 *     tags: [Validations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrPayload:
 *                 type: string
 *           example:
 *             qrPayload: '{"id":"studentId","balance":350,"ts":1720876800000}'
 *     responses:
 *       200:
 *         description: Ticket validé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isValid:
 *                   type: boolean
 *                 balance:
 *                   type: number
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               isValid: true
 *               balance: 350
 *               message: "Ticket validé."
 */
router.post('/', requireAuth(['driver']), validateTicket);

/**
 * @swagger
 * /api/validations/history:
 *   get:
 *     summary: Historique des validations (protégé)
 *     tags: [Validations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste paginée des validations
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
 *                       validationId:
 *                         type: string
 *                       ticketId:
 *                         type: string
 *                       driverId:
 *                         type: string
 *                       validatedAt:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 - validationId: "val1"
 *                   ticketId: "ticket123"
 *                   driverId: "driver456"
 *                   validatedAt: "2024-06-01T12:00:00Z"
 *               message: "Historique des validations"
 */
// router.get('/history', requireAuth(['driver', 'admin']), getValidationHistory);

export default router;
