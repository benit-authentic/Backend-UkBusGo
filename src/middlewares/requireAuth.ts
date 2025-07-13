import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Middleware pour protéger les routes par JWT
 * Ajoute req.user = { id, role }
 */
export const requireAuth = (roles: string[] = []) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token) as any;
    if (roles.length && !roles.includes(payload.role)) {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }
    // @ts-ignore
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide.' });
  }
};
