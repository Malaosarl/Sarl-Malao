import express from 'express';
import { generateQuotePDF, generateProductionReportPDF } from '../controllers/pdfController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/quotes/:quote_id', generateQuotePDF);
router.get('/production-report', generateProductionReportPDF);

export default router;

