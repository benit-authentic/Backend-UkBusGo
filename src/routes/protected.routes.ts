import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

// Exemple de route protégée pour étudiant
router.get('/student-only', requireAuth(['student']), (req: Request, res: Response) => {
  // @ts-ignore
  res.json({ success: true, message: `Bienvenue étudiant ${req.user.id}` });
});

// Exemple de route protégée pour chauffeur
router.get('/driver-only', requireAuth(['driver']), (req: Request, res: Response) => {
  // @ts-ignore
  res.json({ success: true, message: `Bienvenue chauffeur ${req.user.id}` });
});

// Exemple de route protégée pour admin
router.get('/admin-only', requireAuth(['admin']), (req: Request, res: Response) => {
  // @ts-ignore
  res.json({ success: true, message: `Bienvenue admin ${req.user.id}` });
});

export default router;
