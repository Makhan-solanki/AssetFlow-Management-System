import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  getCategories,
  createCategory,
  updateCategory,
  getEmployees,
  updateEmployeeRoleOrDept,
} from '../controllers/org';
import { requireAuth, requireRoles } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Everyone authenticated can view org structure
router.get('/departments', requireAuth, getDepartments);
router.get('/categories', requireAuth, getCategories);
router.get('/employees', requireAuth, getEmployees);

// Admin-only operations
router.post('/departments', requireAuth, requireRoles(Role.ADMIN), createDepartment);
router.put('/departments/:id', requireAuth, requireRoles(Role.ADMIN), updateDepartment);

router.post('/categories', requireAuth, requireRoles(Role.ADMIN), createCategory);
router.put('/categories/:id', requireAuth, requireRoles(Role.ADMIN), updateCategory);

router.put('/employees/:id/role', requireAuth, requireRoles(Role.ADMIN), updateEmployeeRoleOrDept);

export default router;
