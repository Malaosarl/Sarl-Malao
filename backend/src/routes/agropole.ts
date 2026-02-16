import express from 'express';
import {
  getSites,
  getParcels,
  recordCrop,
  recordHarvest,
  getHarvests,
  getAgropoleStats
} from '../controllers/agropoleController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/sites', getSites);
router.get('/parcels', getParcels);
router.post('/crops', recordCrop);
router.post('/harvests', recordHarvest);
router.get('/harvests', getHarvests);
router.get('/stats', getAgropoleStats);

export default router;




