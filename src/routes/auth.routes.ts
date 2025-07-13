import { Router } from 'express';
import { refreshToken } from '../controllers/auth.controller';

const router = Router();

// Endpoint de refresh token
router.post('/refresh', refreshToken);

export default router;
