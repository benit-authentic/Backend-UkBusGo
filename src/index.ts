import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import validationRoutes from './routes/validation.routes';
import transactionRoutes from './routes/transaction.routes';
import paygateWebhookRoutes from './routes/paygate.webhook.routes';
import fedaPayWebhookRoutes from './routes/fedapay.webhook.routes'; // Nouveau
import protectedRoutes from './routes/protected.routes';
import studentRoutes from './routes/student.routes';
import driverRoutes from './routes/driver.routes';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import { config } from './config/config';
import { healthCheck, simpleHealthCheck } from './controllers/health.controller';
import { proxyDebugMiddleware, ipNormalizationMiddleware } from './middlewares/proxy.middleware';
import morgan from 'morgan';

const app = express();

// ⚠️ IMPORTANT: Configuration trust proxy AVANT rate limiting
// Railway, Render, et autres plateformes envoient X-Forwarded-For
app.set('trust proxy', true); // Toujours activer pour Railway/Render
console.log('🔧 Trust proxy activé (requis pour Railway/Render)');

app.use(morgan('dev'));

// Middlewares de debug et normalisation IP
if (process.env.DEBUG === 'true') {
  app.use(proxyDebugMiddleware);
}
app.use(ipNormalizationMiddleware);

app.use(helmet());

// Configuration CORS améliorée pour gérer withCredentials
const corsOptions = {
  origin: config.corsOrigin === '*' 
    ? true // Accepte toutes les origines en développement
    : config.corsOrigin.split(',').map(o => o.trim()),
  credentials: true, // Permet withCredentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight pendant 10 minutes
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate limiting - trust proxy déjà configuré au-dessus
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  standardHeaders: true,
  legacyHeaders: false,
  // Trust proxy est déjà configuré globalement
  keyGenerator: (req: any) => {
    // express-rate-limit utilisera automatiquement X-Forwarded-For
    return req.ip || 'unknown';
  },
  // Skip rate limiting pour les health checks
  skip: (req: express.Request) => {
    return req.path === '/health' || req.path === '/api/health';
  },
  // Message personnalisé
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer dans 15 minutes'
  }
};

app.use(rateLimit(rateLimitConfig));

// Health check endpoints
app.get('/health', simpleHealthCheck);  // Simple pour load balancers
app.get('/api/health', healthCheck);    // Détaillé pour monitoring

// Auth global (refresh token, etc.)
app.use('/api/auth', authRoutes);

// Routes étudiants
app.use('/api/students', studentRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admins', adminRoutes);

// Routes protégées d'exemple
app.use('/api/protected', protectedRoutes);
app.use('/api/paygate', paygateWebhookRoutes);
app.use('/api/fedapay', fedaPayWebhookRoutes); // Nouveau webhook FedaPay
app.use('/api/transactions', transactionRoutes);
app.use('/api/validations', validationRoutes);

export default app;
