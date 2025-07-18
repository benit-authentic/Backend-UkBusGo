import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || '5000',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  paygateApiKey: process.env.PAYGATE_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  // Configuration pour les plateformes de déploiement
  isProduction: process.env.NODE_ENV === 'production',
  trustProxy: process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production',
};
