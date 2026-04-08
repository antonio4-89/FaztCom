import { Router } from 'express';
import { login, forgotPassword, resetPassword, changePassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', authMiddleware, changePassword);

export default router;
