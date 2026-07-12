import { Router } from 'express';
import { signup, verifyEmail, login, getMe, forgotPassword } from '../controllers/auth';
import { requireAuth } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { signupSchema, loginSchema, forgotPasswordSchema } from '../validators/auth';

const router = Router();

router.post('/signup', validateBody(signupSchema), signup);
router.post('/verify-email', verifyEmail);
router.post('/login', validateBody(loginSchema), login);
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.get('/me', requireAuth, getMe);

export default router;


