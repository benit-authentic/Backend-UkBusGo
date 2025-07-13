import { Router } from 'express';
import { paygateWebhook } from '../controllers/paygate.webhook.controller';

const router = Router();

/**
 * @swagger
 * /api/paygate/webhook:
 *   post:
 *     summary: Webhook Paygate (callback paiement)
 *     tags: [Paygate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [success, failed]
 *               amount:
 *                 type: number
 *               reference:
 *                 type: string
 *           example:
 *             identifier: "tx1"
 *             status: "success"
 *             amount: 2000
 *             reference: "ref123"
 *     responses:
 *       200:
 *         description: Webhook reçu et traité
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
 *               message: "Webhook traité avec succès"
 */
router.post('/webhook', paygateWebhook);

export default router;
