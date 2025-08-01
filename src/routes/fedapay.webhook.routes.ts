import { Router } from 'express';
import { fedaPayWebhook } from '../controllers/fedapay.webhook.controller';

const router = Router();

/**
 * @swagger
 * /api/fedapay/webhook:
 *   post:
 *     summary: Webhook FedaPay pour notifications en temps réel
 *     description: |
 *       Endpoint qui reçoit les notifications webhook de FedaPay lorsqu'une transaction change de statut.
 *       
 *       **Événements gérés :**
 *       - `transaction.created` : Transaction créée
 *       - `transaction.approved` : Paiement approuvé et réussi
 *       - `transaction.canceled` : Transaction annulée
 *       - `transaction.declined` : Paiement refusé
 *       - `transaction.transferred` : Fonds transférés au marchand
 *       - `transaction.updated` : Mise à jour générale de la transaction
 *       
 *       **Sécurité :**
 *       - Vérification des signatures FedaPay via `X-FEDAPAY-SIGNATURE`
 *       - Validation des timestamps (max 5 minutes)
 *       - Identification des sources FedaPay officielles
 *       
 *     tags:
 *       - FedaPay
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Type d'événement FedaPay
 *                 example: "transaction.approved"
 *               entity:
 *                 type: object
 *                 description: Données de la transaction FedaPay
 *                 properties:
 *                   id:
 *                     type: number
 *                     description: ID de la transaction FedaPay
 *                     example: 12345
 *                   reference:
 *                     type: string
 *                     description: Référence FedaPay
 *                     example: "1691234567890"
 *                   merchant_reference:
 *                     type: string
 *                     description: Votre référence personnalisée
 *                     example: "UKBUS-1691234567890-603d2d1a5f1b2c001f647b23"
 *                   amount:
 *                     type: number
 *                     description: Montant en FCFA
 *                     example: 1500
 *                   status:
 *                     type: string
 *                     description: Statut FedaPay
 *                     enum: [pending, approved, canceled, declined, transferred]
 *                     example: "approved"
 *                   custom_metadata:
 *                     type: object
 *                     description: Métadonnées personnalisées
 *                     properties:
 *                       student_id:
 *                         type: string
 *                         example: "603d2d1a5f1b2c001f647b23"
 *                       service:
 *                         type: string
 *                         example: "ukbus_recharge"
 *                       network:
 *                         type: string
 *                         example: "FLOOZ"
 *     responses:
 *       200:
 *         description: Webhook traité avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook traité avec succès"
 *                 event_type:
 *                   type: string
 *                   example: "transaction.approved"
 *       400:
 *         description: Données webhook invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Données webhook invalides"
 *       401:
 *         description: Signature invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Signature invalide"
 */
router.post('/webhook', fedaPayWebhook);

export default router;
