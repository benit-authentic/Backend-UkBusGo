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
import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

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
