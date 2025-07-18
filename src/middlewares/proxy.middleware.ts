import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de logging pour debug les proxies et headers
 */
export const proxyDebugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Ne logger qu'en développement ou si DEBUG=true
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
    console.log('🔍 Debug Proxy Info:');
    console.log('  - req.ip:', req.ip);
    console.log('  - req.ips:', req.ips);
    console.log('  - X-Forwarded-For:', req.get('X-Forwarded-For'));
    console.log('  - X-Real-IP:', req.get('X-Real-IP'));
    console.log('  - CF-Connecting-IP:', req.get('CF-Connecting-IP')); // Cloudflare
    console.log('  - Trust proxy setting:', req.app.get('trust proxy'));
    console.log('  - Connection remote address:', req.connection?.remoteAddress);
  }
  next();
};

/**
 * Middleware pour gérer les IPs de façon robuste
 */
export const ipNormalizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Récupérer l'IP réelle selon la plateforme
  let clientIP = req.ip;
  
  // Railway spécifique
  if (req.get('X-Forwarded-For')) {
    const forwardedIPs = req.get('X-Forwarded-For')!.split(',');
    clientIP = forwardedIPs[0].trim();
  }
  
  // Render spécifique
  if (req.get('X-Real-IP')) {
    clientIP = req.get('X-Real-IP')!;
  }
  
  // Cloudflare spécifique
  if (req.get('CF-Connecting-IP')) {
    clientIP = req.get('CF-Connecting-IP')!;
  }
  
  // Ajouter l'IP normalisée à la requête
  (req as any).clientIP = clientIP;
  
  next();
};
