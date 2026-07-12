import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/stats', requireAuth, getDashboardStats);

export default router;
