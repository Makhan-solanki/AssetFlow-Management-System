import { Router } from 'express';
import {
  getMaintenanceRequests,
  raiseRequest,
  updateMaintenanceStatus,
} from '../controllers/maintenance';
import { requireAuth, requireRoles } from '../middlewares/auth';
import { Role } from '../utils/enums';

const router = Router();

router.get('/', requireAuth, getMaintenanceRequests);
router.post('/', requireAuth, raiseRequest);

// Only Asset Managers and Admins can approve/progress maintenance
router.put('/:id/status', requireAuth, requireRoles(Role.ADMIN, Role.ASSET_MANAGER), updateMaintenanceStatus);

export default router;
