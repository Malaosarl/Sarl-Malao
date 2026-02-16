import express from 'express';
import {
  calculateProductionCost,
  getProfitability,
  getCostEvolution,
  getCostBreakdown
} from '../controllers/costsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/production-cost', calculateProductionCost);
router.get('/profitability', getProfitability);
router.get('/evolution', getCostEvolution);
router.get('/breakdown', getCostBreakdown);

export default router;





