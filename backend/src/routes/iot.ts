import express from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import {
  recordSensorData,
  getSensorData,
  getAlerts,
  getHousings,
  getDevices,
} from '../controllers/iotController';

const router = express.Router();


router.use(authenticate);


router.post(
  '/sensor-data',
  recordSensorData
);


router.get(
  '/sensor-data',
  requirePermission('agropole', 'read'),
  getSensorData
);


router.get(
  '/alerts',
  requirePermission('agropole', 'read'),
  getAlerts
);


router.get(
  '/housings',
  requirePermission('agropole', 'read'),
  getHousings
);


router.get(
  '/devices',
  requirePermission('agropole', 'read'),
  getDevices
);

export default router;










