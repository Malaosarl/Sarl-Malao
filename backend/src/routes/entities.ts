import express from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import {
  createEntity,
  getEntity,
  getEntityTree,
  getAllEntities,
  updateEntity,
  deleteEntity,
} from '../controllers/entityController';

const router = express.Router();


router.use(authenticate);


router.get(
  '/',
  requirePermission('entities', 'read'),
  getAllEntities
);


router.get(
  '/:id',
  requirePermission('entities', 'read'),
  getEntity
);


router.get(
  '/:id/tree',
  requirePermission('entities', 'read'),
  getEntityTree
);


router.post(
  '/',
  requirePermission('entities', 'create'),
  createEntity
);


router.put(
  '/:id',
  requirePermission('entities', 'update'),
  updateEntity
);


router.delete(
  '/:id',
  requirePermission('entities', 'delete'),
  deleteEntity
);

export default router;










