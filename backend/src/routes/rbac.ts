import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import {
  getMyPermissions,
  getAllRoles,
  createRole,
  updateRole,
  initializeRoles,
} from '../controllers/rbacController';

const router = express.Router();


router.use(authenticate);


router.get('/permissions', getMyPermissions);


router.get(
  '/roles',
  authorize('admin', 'super_admin'),
  getAllRoles
);


router.post(
  '/roles',
  authorize('admin', 'super_admin'),
  requirePermission('roles', 'create'),
  createRole
);


router.put(
  '/roles/:id',
  authorize('admin', 'super_admin'),
  requirePermission('roles', 'update'),
  updateRole
);


router.post(
  '/roles/initialize',
  authorize('admin', 'super_admin'),
  initializeRoles
);

export default router;










