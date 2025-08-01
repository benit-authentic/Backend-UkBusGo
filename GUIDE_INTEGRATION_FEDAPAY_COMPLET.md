# 🚀 Guide Complet : Intégration FedaPay de A à Z

**Guide de référence pour l'intégration complète de FedaPay dans une application Node.js/TypeScript**

---

## 📋 Table des matières

1. [Prérequis et préparation](#1-prérequis-et-préparation)
2. [Configuration du compte FedaPay](#2-configuration-du-compte-fedapay)
3. [Installation et configuration backend](#3-installation-et-configuration-backend)
4. [Implémentation du service FedaPay](#4-implémentation-du-service-fedapay)
5. [Configuration des webhooks](#5-configuration-des-webhooks)
6. [Utilitaires et validation](#6-utilitaires-et-validation)
7. [Modèles de données](#7-modèles-de-données)
8. [Routes et contrôleurs](#8-routes-et-contrôleurs)
9. [Tests et validation](#9-tests-et-validation)
10. [Déploiement et production](#10-déploiement-et-production)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prérequis et préparation

### 1.1 Environnement technique
- ✅ Node.js 16+ installé
- ✅ MongoDB configuré
- ✅ TypeScript installé
- ✅ Express.js configuré
- ✅ Mongoose pour MongoDB

### 1.2 Compte FedaPay
- ✅ Compte sandbox FedaPay créé : https://dashboard.fedapay.com
- ✅ Accès au dashboard de développement
- ✅ Clés API sandbox récupérées

### 1.3 Pays supportés
FedaPay supporte actuellement :
- 🇧🇯 **Bénin** : MTN Mobile Money, Moov Money
- 🇧🇫 **Burkina Faso** : Orange Money, Moov Money
- 🇨🇮 **Côte d'Ivoire** : Orange Money, MTN Mobile Money, Moov Money
- 🇹🇬 **Togo** : FLOOZ (Moov), TMONEY (Togocel)

---

## 2. Configuration du compte FedaPay

### 2.1 Création du compte
1. **Inscription :** https://dashboard.fedapay.com/register
2. **Vérification email**
3. **Configuration du profil entreprise**
4. **Validation KYC (documents requis)**

### 2.2 Récupération des clés API

#### Sandbox (Tests) :
```bash
# Dashboard → Développeurs → Clés API → Sandbox
FEDAPAY_PUBLIC_KEY=pk_sandbox_xxxxxxxx
FEDAPAY_SECRET_KEY=sk_sandbox_xxxxxxxx
```

#### Production :
```bash
# Dashboard → Développeurs → Clés API → Live
FEDAPAY_PUBLIC_KEY=pk_live_xxxxxxxx
FEDAPAY_SECRET_KEY=sk_live_xxxxxxxx
```

### 2.3 Configuration des webhooks
```bash
# Dashboard → Développeurs → Webhooks
FEDAPAY_WEBHOOK_SECRET=wh_sandbox_xxxxxxxx
```

---

## 3. Installation et configuration backend

### 3.1 Installation des dépendances
```bash
npm install fedapay axios
npm install --save-dev @types/node
```

### 3.2 Configuration de l'environnement (.env)
```env
# Configuration FedaPay
FEDAPAY_ENVIRONMENT=sandbox
FEDAPAY_PUBLIC_KEY=pk_sandbox_xxxxxxxx
FEDAPAY_SECRET_KEY=sk_sandbox_xxxxxxxx
FEDAPAY_WEBHOOK_SECRET=wh_sandbox_xxxxxxxx

# URLs
WEBHOOK_URL=https://votre-domaine.com/api/fedapay/webhook
FRONTEND_URL=http://localhost:3000

# Base de données
MONGODB_URI=mongodb://localhost:27017/ukbus

# JWT
JWT_SECRET=votre_jwt_secret_ici
```

### 3.3 Structure des fichiers
```
src/
├── services/
│   └── fedapay.service.ts
├── controllers/
│   └── fedapay.webhook.controller.ts
├── utils/
│   └── phone.utils.ts
├── models/
│   └── transaction.model.ts
├── routes/
│   └── fedapay.routes.ts
└── types/
    └── transaction.schema.ts
```

---

## 4. Implémentation du service FedaPay

### 4.1 Service principal (src/services/fedapay.service.ts)
```typescript
import axios from 'axios';
import { validateTogolanesePhoneNumber, formatForFedaPay } from '../utils/phone.utils';

export class FedaPayService {
  private readonly baseURL: string;
  private readonly secretKey: string;

  constructor() {
    this.baseURL = process.env.FEDAPAY_ENVIRONMENT === 'live' 
      ? 'https://api.fedapay.com' 
      : 'https://sandbox-api.fedapay.com';
    this.secretKey = process.env.FEDAPAY_SECRET_KEY!;
  }

  /**
   * Initier un paiement FedaPay
   */
  async initiateFedaPayPayment(data: {
    amount: number;
    phone_number: string;
    description: string;
    merchant_reference: string;
    customer_email?: string;
    customer_name?: string;
  }) {
    try {
      // Validation du numéro de téléphone
      const validationResult = validateTogolanesePhoneNumber(data.phone_number);
      if (!validationResult.isValid) {
        throw new Error(`Numéro invalide: ${validationResult.error}`);
      }

      // Formatage pour FedaPay
      const formattedPhone = formatForFedaPay(data.phone_number);

      const payload = {
        transaction: {
          amount: data.amount,
          description: data.description,
          callback_url: `${process.env.WEBHOOK_URL}`,
          custom_metadata: {
            merchant_reference: data.merchant_reference,
            original_phone: data.phone_number,
            customer_email: data.customer_email,
            customer_name: data.customer_name
          }
        },
        customer: {
          phone_number: {
            number: formattedPhone,
            country: validationResult.country
          },
          ...(data.customer_email && { email: data.customer_email }),
          ...(data.customer_name && { firstname: data.customer_name })
        }
      };

      const response = await axios.post(
        `${this.baseURL}/v1/transactions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        transaction_id: response.data.v1.id,
        status: response.data.v1.status,
        payment_url: response.data.v1.payment_url,
        token: response.data.v1.token,
        raw_response: response.data
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Vérifier le statut d'une transaction
   */
  async checkFedaPayStatus(transactionId: string) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        status: response.data.v1.status,
        amount: response.data.v1.amount,
        fees: response.data.v1.fees,
        transaction_id: response.data.v1.id,
        raw_response: response.data
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Traitement direct mobile money
   */
  async sendMobilePayment(data: {
    amount: number;
    phone_number: string;
    description: string;
    merchant_reference: string;
  }) {
    try {
      const validationResult = validateTogolanesePhoneNumber(data.phone_number);
      if (!validationResult.isValid) {
        throw new Error(`Numéro invalide: ${validationResult.error}`);
      }

      const formattedPhone = formatForFedaPay(data.phone_number);

      const payload = {
        amount: data.amount,
        description: data.description,
        phone_number: formattedPhone,
        country: validationResult.country,
        merchant_reference: data.merchant_reference
      };

      const response = await axios.post(
        `${this.baseURL}/v1/mobile_money/send`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        transaction_id: response.data.transaction_id,
        status: response.data.status,
        raw_response: response.data
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

export const fedaPayService = new FedaPayService();
```

### 4.2 Utilitaires de validation (src/utils/phone.utils.ts)
```typescript
/**
 * Validation des numéros de téléphone togolais
 */
export function validateTogolanesePhoneNumber(phoneNumber: string) {
  // Nettoyer le numéro
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Patterns pour le Togo
  const patterns = {
    // Numéros réels
    flooz: /^(\+228|228|00228)?(70|90|91|92|93|94|95|96|97|98|99)\d{6}$/,
    tmoney: /^(\+228|228|00228)?(79|77)\d{6}$/,
    
    // Numéros de test FedaPay
    test: /^(\+228|228|00228)?(70123456|90123456|91123456)$/
  };

  // Vérification FLOOZ
  if (patterns.flooz.test(cleaned)) {
    return {
      isValid: true,
      network: 'FLOOZ',
      country: 'TG',
      operator: 'moov',
      formatted: normalizeTogolanesePhoneNumber(cleaned)
    };
  }

  // Vérification TMONEY
  if (patterns.tmoney.test(cleaned)) {
    return {
      isValid: true,
      network: 'TMONEY',
      country: 'TG',
      operator: 'togocel',
      formatted: normalizeTogolanesePhoneNumber(cleaned)
    };
  }

  // Vérification numéros de test
  if (patterns.test.test(cleaned)) {
    return {
      isValid: true,
      network: 'TEST',
      country: 'TG',
      operator: 'test',
      formatted: normalizeTogolanesePhoneNumber(cleaned)
    };
  }

  return {
    isValid: false,
    error: 'Format de numéro togolais invalide. Utilisez: +228XXXXXXXX ou 228XXXXXXXX'
  };
}

/**
 * Normaliser un numéro togolais
 */
export function normalizeTogolanesePhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Supprimer les préfixes internationaux
  if (cleaned.startsWith('+228')) {
    return cleaned.substring(4);
  }
  if (cleaned.startsWith('00228')) {
    return cleaned.substring(5);
  }
  if (cleaned.startsWith('228')) {
    return cleaned.substring(3);
  }
  
  return cleaned;
}

/**
 * Formater pour FedaPay (format international)
 */
export function formatForFedaPay(phoneNumber: string): string {
  const normalized = normalizeTogolanesePhoneNumber(phoneNumber);
  return `+228${normalized}`;
}
```

---

## 5. Configuration des webhooks

### 5.1 Contrôleur webhook (src/controllers/fedapay.webhook.controller.ts)
```typescript
import { Request, Response } from 'express';
import crypto from 'crypto';
import { Transaction } from '../models/transaction.model';

/**
 * Vérifier la signature du webhook FedaPay
 */
function verifyFedaPaySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    const providedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  } catch (error) {
    return false;
  }
}

/**
 * Traiter les webhooks FedaPay
 */
export async function fedaPayWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-fedapay-signature'] as string;
    const payload = JSON.stringify(req.body);
    const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET!;

    // Vérification de signature
    if (!verifyFedaPaySignature(payload, signature, webhookSecret)) {
      console.error('❌ Signature webhook invalide');
      return res.status(401).json({ error: 'Signature invalide' });
    }

    const { event, entity } = req.body;
    
    console.log(`✅ Webhook FedaPay reçu: ${event}`);
    console.log('📦 Données:', JSON.stringify(entity, null, 2));

    // Traitement selon le type d'événement
    switch (event) {
      case 'transaction.created':
        await handleTransactionCreated(entity);
        break;
        
      case 'transaction.approved':
        await handleTransactionApproved(entity);
        break;
        
      case 'transaction.canceled':
        await handleTransactionCanceled(entity);
        break;
        
      case 'transaction.declined':
        await handleTransactionDeclined(entity);
        break;
        
      case 'transaction.transferred':
        await handleTransactionTransferred(entity);
        break;
        
      default:
        console.log(`⚠️ Événement non géré: ${event}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Erreur webhook FedaPay:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
}

// Gestionnaires d'événements
async function handleTransactionCreated(entity: any) {
  const merchantRef = entity.custom_metadata?.merchant_reference;
  if (!merchantRef) return;

  await Transaction.findOneAndUpdate(
    { merchant_reference: merchantRef },
    {
      fedapay_transaction_id: entity.id,
      status: 'pending',
      fedapay_status: entity.status,
      fedapay_data: entity
    },
    { upsert: true }
  );
}

async function handleTransactionApproved(entity: any) {
  const merchantRef = entity.custom_metadata?.merchant_reference;
  if (!merchantRef) return;

  await Transaction.findOneAndUpdate(
    { merchant_reference: merchantRef },
    {
      status: 'completed',
      fedapay_status: entity.status,
      completed_at: new Date(),
      amount_paid: entity.amount,
      fees_paid: entity.fees,
      fedapay_data: entity
    }
  );
}

async function handleTransactionCanceled(entity: any) {
  const merchantRef = entity.custom_metadata?.merchant_reference;
  if (!merchantRef) return;

  await Transaction.findOneAndUpdate(
    { merchant_reference: merchantRef },
    {
      status: 'cancelled',
      fedapay_status: entity.status,
      fedapay_data: entity
    }
  );
}

async function handleTransactionDeclined(entity: any) {
  const merchantRef = entity.custom_metadata?.merchant_reference;
  if (!merchantRef) return;

  await Transaction.findOneAndUpdate(
    { merchant_reference: merchantRef },
    {
      status: 'failed',
      fedapay_status: entity.status,
      fedapay_data: entity
    }
  );
}

async function handleTransactionTransferred(entity: any) {
  const merchantRef = entity.custom_metadata?.merchant_reference;
  if (!merchantRef) return;

  await Transaction.findOneAndUpdate(
    { merchant_reference: merchantRef },
    {
      fedapay_status: entity.status,
      transferred_at: new Date(),
      fedapay_data: entity
    }
  );
}
```

### 5.2 Routes webhook (src/routes/fedapay.routes.ts)
```typescript
import { Router } from 'express';
import { fedaPayWebhook } from '../controllers/fedapay.webhook.controller';

const router = Router();

// Webhook FedaPay (sans authentification pour les callbacks)
router.post('/webhook', fedaPayWebhook);

export default router;
```

---

## 6. Utilitaires et validation

### 6.1 Validation des schémas (src/types/transaction.schema.ts)
```typescript
import Joi from 'joi';

export const initiatePaymentSchema = Joi.object({
  amount: Joi.number().positive().required()
    .messages({
      'number.positive': 'Le montant doit être positif',
      'any.required': 'Le montant est requis'
    }),
    
  phone_number: Joi.string().required()
    .messages({
      'any.required': 'Le numéro de téléphone est requis'
    }),
    
  description: Joi.string().max(255).required()
    .messages({
      'string.max': 'La description ne peut dépasser 255 caractères',
      'any.required': 'La description est requise'
    }),
    
  customer_email: Joi.string().email().optional(),
  customer_name: Joi.string().max(100).optional()
});
```

---

## 7. Modèles de données

### 7.1 Modèle Transaction étendu (src/models/transaction.model.ts)
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  // Champs existants
  student_id: mongoose.Types.ObjectId;
  amount: number;
  type: 'recharge' | 'ticket_purchase';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  // Nouveaux champs FedaPay
  fedapay_transaction_id?: string;
  fedapay_status?: string;
  merchant_reference: string;
  payment_method: 'paygate' | 'fedapay';
  
  // Métadonnées FedaPay
  fedapay_data?: any;
  fees_paid?: number;
  amount_paid?: number;
  
  // Dates
  created_at: Date;
  completed_at?: Date;
  transferred_at?: Date;
}

const transactionSchema = new Schema<ITransaction>({
  student_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  type: { 
    type: String, 
    enum: ['recharge', 'ticket_purchase'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  
  // Champs FedaPay
  fedapay_transaction_id: { 
    type: String, 
    sparse: true 
  },
  fedapay_status: { 
    type: String 
  },
  merchant_reference: { 
    type: String, 
    required: true, 
    unique: true 
  },
  payment_method: { 
    type: String, 
    enum: ['paygate', 'fedapay'], 
    default: 'fedapay' 
  },
  
  // Métadonnées
  fedapay_data: { 
    type: Schema.Types.Mixed 
  },
  fees_paid: { 
    type: Number, 
    min: 0 
  },
  amount_paid: { 
    type: Number, 
    min: 0 
  },
  
  // Timestamps
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  completed_at: { 
    type: Date 
  },
  transferred_at: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Index pour les recherches
transactionSchema.index({ merchant_reference: 1 });
transactionSchema.index({ fedapay_transaction_id: 1 });
transactionSchema.index({ student_id: 1, status: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
```

---

## 8. Routes et contrôleurs

### 8.1 Contrôleur principal (src/controllers/transaction.controller.ts)
```typescript
import { Request, Response } from 'express';
import { fedaPayService } from '../services/fedapay.service';
import { Transaction } from '../models/transaction.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initier un paiement
 */
export async function initiatePayment(req: Request, res: Response) {
  try {
    const { amount, phone_number, description, customer_email, customer_name } = req.body;
    const student_id = req.user.id; // Depuis le middleware d'auth
    
    // Générer une référence unique
    const merchant_reference = `TXN_${Date.now()}_${uuidv4().substring(0, 8)}`;
    
    // Créer la transaction en base
    const transaction = new Transaction({
      student_id,
      amount,
      type: 'recharge', // ou selon le contexte
      merchant_reference,
      payment_method: 'fedapay',
      status: 'pending'
    });
    
    await transaction.save();
    
    // Initier le paiement FedaPay
    const fedaPayResult = await fedaPayService.initiateFedaPayPayment({
      amount,
      phone_number,
      description,
      merchant_reference,
      customer_email,
      customer_name
    });
    
    if (!fedaPayResult.success) {
      // Marquer la transaction comme échouée
      transaction.status = 'failed';
      await transaction.save();
      
      return res.status(400).json({
        success: false,
        error: fedaPayResult.error,
        details: fedaPayResult.details
      });
    }
    
    // Mettre à jour avec les données FedaPay
    transaction.fedapay_transaction_id = fedaPayResult.transaction_id;
    transaction.fedapay_status = fedaPayResult.status;
    transaction.fedapay_data = fedaPayResult.raw_response;
    await transaction.save();
    
    res.json({
      success: true,
      transaction_id: transaction._id,
      fedapay_transaction_id: fedaPayResult.transaction_id,
      payment_url: fedaPayResult.payment_url,
      token: fedaPayResult.token,
      status: fedaPayResult.status
    });
    
  } catch (error) {
    console.error('Erreur initiation paiement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
}

/**
 * Vérifier le statut d'un paiement
 */
export async function checkPaymentStatus(req: Request, res: Response) {
  try {
    const { transaction_id } = req.params;
    const student_id = req.user.id;
    
    // Trouver la transaction
    const transaction = await Transaction.findOne({
      _id: transaction_id,
      student_id
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction non trouvée'
      });
    }
    
    // Si on a un ID FedaPay, vérifier le statut
    if (transaction.fedapay_transaction_id) {
      const fedaPayResult = await fedaPayService.checkFedaPayStatus(
        transaction.fedapay_transaction_id
      );
      
      if (fedaPayResult.success) {
        // Mettre à jour si nécessaire
        if (transaction.fedapay_status !== fedaPayResult.status) {
          transaction.fedapay_status = fedaPayResult.status;
          
          // Mapper les statuts FedaPay vers nos statuts
          switch (fedaPayResult.status) {
            case 'approved':
              transaction.status = 'completed';
              transaction.completed_at = new Date();
              transaction.amount_paid = fedaPayResult.amount;
              transaction.fees_paid = fedaPayResult.fees;
              break;
            case 'canceled':
              transaction.status = 'cancelled';
              break;
            case 'declined':
              transaction.status = 'failed';
              break;
          }
          
          await transaction.save();
        }
      }
    }
    
    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        fedapay_status: transaction.fedapay_status,
        fedapay_transaction_id: transaction.fedapay_transaction_id,
        merchant_reference: transaction.merchant_reference,
        created_at: transaction.created_at,
        completed_at: transaction.completed_at
      }
    });
    
  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
}
```

### 8.2 Routes principales (src/routes/transaction.routes.ts)
```typescript
import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { requireAuth } from '../middlewares/requireAuth';
import { initiatePaymentSchema } from '../types/transaction.schema';
import { initiatePayment, checkPaymentStatus } from '../controllers/transaction.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Initier un paiement
router.post('/initiate', validateRequest(initiatePaymentSchema), initiatePayment);

// Vérifier le statut d'un paiement
router.get('/:transaction_id/status', checkPaymentStatus);

export default router;
```

---

## 9. Tests et validation

### 9.1 Script de test complet (test_fedapay_complet.js)
```javascript
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

// Données de test
const testData = {
  // Étudiant de test (créez un compte étudiant d'abord)
  student: {
    email: 'test@example.com',
    password: 'test123456'
  },
  // Paiement de test
  payment: {
    amount: 1000, // 1000 FCFA
    phone_number: '+22870123456', // Numéro de test FedaPay
    description: 'Test recharge compte étudiant',
    customer_email: 'test@example.com',
    customer_name: 'Test User'
  }
};

async function runFullTest() {
  try {
    console.log('🚀 Début du test complet FedaPay\n');

    // Étape 1: Connexion étudiant
    console.log('1️⃣ Connexion étudiant...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testData.student.email,
      password: testData.student.password,
      user_type: 'student'
    });

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie\n');

    // Étape 2: Initiation du paiement
    console.log('2️⃣ Initiation du paiement FedaPay...');
    const paymentResponse = await axios.post(
      `${BASE_URL}/transactions/initiate`,
      testData.payment,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { transaction_id, fedapay_transaction_id, payment_url } = paymentResponse.data;
    console.log('✅ Paiement initié:');
    console.log(`   Transaction ID: ${transaction_id}`);
    console.log(`   FedaPay ID: ${fedapay_transaction_id}`);
    console.log(`   URL de paiement: ${payment_url}\n`);

    // Étape 3: Vérification du statut initial
    console.log('3️⃣ Vérification du statut initial...');
    const statusResponse = await axios.get(
      `${BASE_URL}/transactions/${transaction_id}/status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Statut initial:', statusResponse.data.transaction.status);
    console.log('✅ Statut FedaPay:', statusResponse.data.transaction.fedapay_status);
    console.log('\n');

    // Étape 4: Simulation d'attente des webhooks
    console.log('4️⃣ Attente des webhooks (30 secondes)...');
    console.log('💡 Pendant ce temps, les webhooks FedaPay peuvent arriver\n');

    await new Promise(resolve => setTimeout(resolve, 30000));

    // Étape 5: Vérification du statut final
    console.log('5️⃣ Vérification du statut final...');
    const finalStatusResponse = await axios.get(
      `${BASE_URL}/transactions/${transaction_id}/status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Statut final:', finalStatusResponse.data.transaction.status);
    console.log('✅ Statut FedaPay final:', finalStatusResponse.data.transaction.fedapay_status);

    if (finalStatusResponse.data.transaction.status === 'completed') {
      console.log('🎉 TEST RÉUSSI: Paiement complété!');
    } else {
      console.log('⏳ TEST EN COURS: Paiement en attente');
    }

  } catch (error) {
    console.error('❌ ERREUR DANS LE TEST:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Données:', error.response.data);
    }
  }
}

// Lancer le test
runFullTest();
```

### 9.2 Test unitaire des utilitaires (tests/phone.utils.test.js)
```javascript
const { validateTogolanesePhoneNumber, formatForFedaPay } = require('../src/utils/phone.utils');

describe('Phone Utils', () => {
  test('Validation numéro FLOOZ valide', () => {
    const result = validateTogolanesePhoneNumber('+22890123456');
    expect(result.isValid).toBe(true);
    expect(result.network).toBe('FLOOZ');
    expect(result.country).toBe('TG');
  });

  test('Validation numéro TMONEY valide', () => {
    const result = validateTogolanesePhoneNumber('22879123456');
    expect(result.isValid).toBe(true);
    expect(result.network).toBe('TMONEY');
    expect(result.country).toBe('TG');
  });

  test('Formatage pour FedaPay', () => {
    const formatted = formatForFedaPay('90123456');
    expect(formatted).toBe('+22890123456');
  });

  test('Numéro invalide', () => {
    const result = validateTogolanesePhoneNumber('123456');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('invalide');
  });
});
```

---

## 10. Déploiement et production

### 10.1 Variables d'environnement de production
```env
# Production FedaPay
FEDAPAY_ENVIRONMENT=live
FEDAPAY_PUBLIC_KEY=pk_live_xxxxxxxx
FEDAPAY_SECRET_KEY=sk_live_xxxxxxxx
FEDAPAY_WEBHOOK_SECRET=wh_live_xxxxxxxx

# URLs de production
WEBHOOK_URL=https://votre-domaine.com/api/fedapay/webhook
FRONTEND_URL=https://votre-app.com

# Sécurité
NODE_ENV=production
JWT_SECRET=votre_secret_jwt_production_complexe
```

### 10.2 Configuration nginx (webhook)
```nginx
server {
    listen 443 ssl;
    server_name votre-domaine.com;

    # Configuration SSL...

    location /api/fedapay/webhook {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Important pour les webhooks
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

### 10.3 Monitoring et logs
```typescript
// Logger pour production (src/utils/logger.ts)
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ] : [])
  ]
});
```

---

## 11. Troubleshooting

### 11.1 Problèmes courants

#### ❌ Erreur: "Invalid phone number format"
**Solution :**
```typescript
// Vérifiez le format du numéro
const phone = "+22890123456"; // ✅ Correct
const phone = "90123456";     // ✅ Correct aussi
const phone = "123456";       // ❌ Incorrect
```

#### ❌ Erreur: "Webhook signature invalid"
**Solution :**
```bash
# Vérifiez votre clé secrète webhook
echo $FEDAPAY_WEBHOOK_SECRET  # Doit commencer par wh_sandbox_ ou wh_live_

# Rechargez les variables d'environnement
source .env
```

#### ❌ Erreur: "Transaction not found"
**Solution :**
```javascript
// Vérifiez que la merchant_reference est unique
const merchant_reference = `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`;
```

### 11.2 Logs utiles

#### Webhook reçu avec succès :
```
✅ Webhook FedaPay reçu: transaction.approved
📦 Données: { id: "txn_xxx", status: "approved", amount: 1000 }
```

#### Erreur de signature :
```
❌ Signature webhook invalide
Expected: abc123...
Received: def456...
```

### 11.3 Tests de santé

#### Test de connectivité FedaPay :
```bash
curl -X GET https://sandbox-api.fedapay.com/v1/ping \
  -H "Authorization: Bearer sk_sandbox_xxxxxxxx"
```

#### Test webhook local :
```bash
curl -X POST http://localhost:5000/api/fedapay/webhook \
  -H "Content-Type: application/json" \
  -H "X-Fedapay-Signature: sha256=test" \
  -d '{"event":"test","entity":{}}'
```

---

## 🎯 Checklist finale

### Avant mise en production :
- [ ] ✅ Compte FedaPay validé (KYC)
- [ ] ✅ Clés de production récupérées
- [ ] ✅ Webhook configuré avec URL HTTPS
- [ ] ✅ Tests complets réalisés en sandbox
- [ ] ✅ Monitoring et logs configurés
- [ ] ✅ Variables d'environnement sécurisées
- [ ] ✅ SSL/TLS configuré
- [ ] ✅ Stratégie de backup des transactions
- [ ] ✅ Plan de rollback préparé

### Tests de validation :
- [ ] ✅ Paiement FLOOZ réussi
- [ ] ✅ Paiement TMONEY réussi
- [ ] ✅ Webhooks reçus et traités
- [ ] ✅ Signatures vérifiées
- [ ] ✅ Gestion des erreurs testée
- [ ] ✅ Performance sous charge validée

---

## 📞 Support

### FedaPay :
- **Documentation :** https://docs.fedapay.com
- **Support :** support@fedapay.com
- **Dashboard :** https://dashboard.fedapay.com

### Ressources utiles :
- **API Reference :** https://docs.fedapay.com/api
- **Webhooks :** https://docs.fedapay.com/webhooks
- **Mobile Money :** https://docs.fedapay.com/mobile-money

---

**© 2025 • BBA - Bénit Boss Authentic**  
*Guide d'intégration FedaPay - Version 1.0*
