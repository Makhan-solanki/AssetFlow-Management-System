import { Router } from 'express';
import { getAssets, getAssetById, registerAsset, updateAsset } from '../controllers/asset';
import { requireAuth, requireRoles } from '../middlewares/auth';
import { Role } from '@prisma/client';
import { validateBody } from '../middlewares/validate';
import { registerAssetSchema, updateAssetSchema } from '../validators/asset';

const router = Router();

router.get('/', requireAuth, getAssets);
router.get('/:id', requireAuth, getAssetById);

// Asset Managers and Admins can register/edit assets
router.post('/', requireAuth, requireRoles(Role.ADMIN, Role.ASSET_MANAGER), validateBody(registerAssetSchema), registerAsset);
router.put('/:id', requireAuth, requireRoles(Role.ADMIN, Role.ASSET_MANAGER), validateBody(updateAssetSchema), updateAsset);

export default router;

