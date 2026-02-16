import express from 'express';
import {
  createQualityControl,
  getQualityControls,
  createNonConformity,
  getNonConformities,
  getConformityRate,
  getNonConformityPareto,
  updateNonConformity
} from '../controllers/qualityController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/controls', getQualityControls);
router.post('/controls', createQualityControl);
router.get('/conformity-rate', getConformityRate);
router.get('/non-conformities', getNonConformities);
router.post('/non-conformities', createNonConformity);
router.put('/non-conformities/:id', updateNonConformity);
router.get('/non-conformities/pareto', getNonConformityPareto);

export default router;



