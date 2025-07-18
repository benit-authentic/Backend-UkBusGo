import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import validationRoutes from './routes/validation.routes';
import transactionRoutes from './routes/transaction.routes';
import paygateWebhookRoutes from './routes/paygate.webhook.routes';
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

// Configuration pour les proxies (Railway, Render, Heroku, etc.)
if (config.trustProxy) {
  app.set('trust proxy', 1); // Trust first proxy (Railway, Render, etc.)
  console.log('🔧 Trust proxy activé pour la production');
}

app.use(morgan('dev'));

// Middlewares de debug et normalisation IP
if (process.env.DEBUG === 'true') {
  app.use(proxyDebugMiddleware);
}
app.use(ipNormalizationMiddleware);

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate limiting avec configuration proxy-aware
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Configuration spéciale pour les proxies
  keyGenerator: (req: any) => {
    // Utiliser l'IP normalisée par notre middleware
    return req.clientIP || req.ip || req.connection?.remoteAddress || 'unknown';
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
app.use('/api/transactions', transactionRoutes);
app.use('/api/validations', validationRoutes);

export default app;
