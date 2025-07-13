import { Request, Response, NextFunction } from 'express';
import { verifyRefreshToken, signAccessToken } from '../utils/jwt';

/**
 * Rafraîchir le token d'accès
 * @route POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token requis.' });
    }
    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Refresh token invalide.' });
    }
    // On ne redonne qu'un access token, jamais un refresh ici
    const accessToken = signAccessToken({ id: payload.id, role: payload.role });
    return res.status(200).json({
      success: true,
      data: { accessToken },
      message: 'Token rafraîchi',
    });
  } catch (err) {
    next(err);
  }
};
