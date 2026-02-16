import express from 'express';
import {
  getInventory,
  recordStockEntry,
  recordStockExit,
  performInventory,
  getLowStockAlerts,
  getStockRotation,
  getLotTraceability
} from '../controllers/inventoryController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', getInventory);
router.get('/alerts/low-stock', getLowStockAlerts);
router.get('/rotation', getStockRotation);
router.get('/traceability/:lot_number', getLotTraceability);
router.post('/entries', recordStockEntry);
router.post('/exits', recordStockExit);
router.post('/inventory', performInventory);

export default router;



