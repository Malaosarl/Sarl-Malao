import express from 'express';
import {
  getProductionPlanning,
  createProductionOrder,
  recordProduction,
  getProductionKPIs,
  getFormulas,
  createFormula,
  getDowntimes,
  recordEnergyData
} from '../controllers/productionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();


router.use(authenticate);


router.get('/planning', getProductionPlanning);
router.post('/orders', createProductionOrder);
router.post('/record', recordProduction);


router.get('/kpis', getProductionKPIs);


router.get('/formulas', getFormulas);
router.post('/formulas', createFormula);


router.get('/downtimes', getDowntimes);
router.post('/energy', recordEnergyData);

export default router;



