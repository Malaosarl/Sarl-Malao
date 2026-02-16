import express from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import {
  createWorkflow,
  getWorkflow,
  submitForApproval,
  approveStep,
  rejectStep,
} from '../controllers/workflowController';

const router = express.Router();


router.use(authenticate);


router.post(
  '/',
  requirePermission('settings', 'update'),
  createWorkflow
);


router.get('/:entityType', getWorkflow);


router.post(
  '/submit',
  requirePermission('production', 'create'),
  submitForApproval
);


router.post(
  '/:validationId/approve/:stepId',
  requirePermission('production', 'approve'),
  approveStep
);


router.post(
  '/:validationId/reject/:stepId',
  requirePermission('production', 'approve'),
  rejectStep
);

export default router;










