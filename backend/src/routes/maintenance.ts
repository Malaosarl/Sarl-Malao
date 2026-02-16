import express from 'express';
import {
  getAssets,
  createIntervention,
  completeIntervention,
  getInterventions,
  getMaintenanceKPIs,
  getPreventiveSchedule
} from '../controllers/maintenanceController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/assets', getAssets);
router.get('/interventions', getInterventions);
router.post('/interventions', createIntervention);
router.put('/interventions/:id/complete', completeIntervention);
router.get('/kpis', getMaintenanceKPIs);
router.get('/schedule', getPreventiveSchedule);

export default router;




