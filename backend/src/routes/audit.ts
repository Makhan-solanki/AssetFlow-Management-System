import { Router } from 'express';
import {
  createAuditCycle,
  getAuditCycles,
  verifyAssetInAudit,
  closeAuditCycle,
} from '../controllers/audit';
import { requireAuth, requireRoles } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/cycles', requireAuth, getAuditCycles);

// Admins and Asset Managers create and close audit cycles
router.post('/cycles', requireAuth, requireRoles(Role.ADMIN, Role.ASSET_MANAGER), createAuditCycle);
router.put('/cycles/:cycleId/close', requireAuth, requireRoles(Role.ADMIN, Role.ASSET_MANAGER), closeAuditCycle);

// Registered auditors (can be employees/department heads assigned to cycle) can verify assets
router.post('/cycles/:cycleId/verify', requireAuth, verifyAssetInAudit);

export default router;
