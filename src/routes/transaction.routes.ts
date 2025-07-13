import { Router } from 'express';
import { getTransactionStatus } from '../controllers/transaction.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

/**
 * @swagger
 * /api/transactions/{identifier}/status:
 *   get:
 *     summary: Vérifier le statut d'une transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique de la transaction
 *     responses:
 *       200:
 *         description: Statut de la transaction
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
 *                     status:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     reference:
 *                       type: string
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               data:
 *                 status: "success"
 *                 amount: 2000
 *                 reference: "ref123"
 *               message: "Statut de la transaction"
 */
router.get('/:identifier/status', requireAuth(['student', 'admin']), getTransactionStatus);

export default router;
