import express from 'express';
import {
  createQuote,
  getQuotes,
  convertQuoteToOrder,
  getOrders,
  getSalesStats,
  getCustomers
} from '../controllers/salesController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/quotes', getQuotes);
router.post('/quotes', createQuote);
router.post('/quotes/:quote_id/convert', convertQuoteToOrder);
router.get('/orders', getOrders);
router.get('/stats', getSalesStats);
router.get('/customers', getCustomers);

export default router;




