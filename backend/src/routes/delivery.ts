import express from 'express';
import {
  getVehicles,
  createDelivery,
  completeDelivery,
  getDeliveries,
  getDeliveryStats
} from '../controllers/deliveryController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/vehicles', getVehicles);
router.get('/deliveries', getDeliveries);
router.post('/deliveries', createDelivery);
router.put('/deliveries/:id/complete', completeDelivery);
router.get('/stats', getDeliveryStats);

export default router;




