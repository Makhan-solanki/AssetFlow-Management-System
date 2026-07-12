import { Router } from 'express';
import {
  allocateAsset,
  returnAsset,
  getAllocations,
  requestTransfer,
  handleTransfer,
  getTransfers,
} from '../controllers/allocation';
import { requireAuth, requireRoles } from '../middlewares/auth';
import { Role } from '../utils/enums';
import { validateBody } from '../middlewares/validate';
import { allocateAssetSchema, transferAssetSchema, returnAssetSchema } from '../validators/allocation';

const router = Router();

router.get('/', requireAuth, getAllocations);
router.get('/transfers', requireAuth, getTransfers);

router.post('/', requireAuth, requireRoles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD), validateBody(allocateAssetSchema), allocateAsset);
router.put('/:id/return', requireAuth, requireRoles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD), validateBody(returnAssetSchema), returnAsset);

router.post('/transfers', requireAuth, validateBody(transferAssetSchema), requestTransfer);
router.put('/transfers/:id', requireAuth, requireRoles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD), handleTransfer);

export default router;

