import express from 'express';
import { exportProduction, exportInventory, exportSales } from '../controllers/excelController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/production', exportProduction);
router.get('/inventory', exportInventory);
router.get('/sales', exportSales);

export default router;

