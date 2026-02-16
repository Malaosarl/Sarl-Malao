import { Response } from 'express';
import { PDFService } from '../services/pdfService';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';


export const generateQuotePDF = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quote_id } = req.params;

    
    const quoteResult = await query(
      `SELECT q.*, c.name as client_name, c.address as client_address
       FROM quotes q
       LEFT JOIN clients c ON q.client_id = c.id
       WHERE q.id = $1`,
      [quote_id]
    );

    if (quoteResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Devis non trouvé' });
      return;
    }

    const quote = quoteResult.rows[0];

    
    const itemsResult = await query(
      `SELECT qi.*, p.name as product_name
       FROM quote_items qi
       LEFT JOIN products p ON qi.product_id = p.id
       WHERE qi.quote_id = $1`,
      [quote_id]
    );

    const items = itemsResult.rows.map((item: any) => ({
      product_name: item.product_name || 'Produit',
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price),
      total: parseFloat(item.quantity) * parseFloat(item.unit_price)
    }));

    const quoteData = {
      quote_number: quote.quote_number || quote.id.substring(0, 8).toUpperCase(),
      client_name: quote.client_name || 'Client',
      client_address: quote.client_address,
      date: quote.created_at,
      valid_until: quote.valid_until,
      items,
      subtotal: parseFloat(quote.total_amount || 0),
      total: parseFloat(quote.total_amount || 0),
      notes: quote.notes
    };

    const pdfBuffer = await PDFService.generateQuotePDF(quoteData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="devis-${quoteData.quote_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const generateProductionReportPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    
    const productionResult = await query(
      `SELECT 
         SUM(quantity_produced) as total_produced,
         SUM(quantity_planned) as total_planned,
         AVG((quantity_produced::float / NULLIF(quantity_planned, 0)) * 100) as achievement_rate
       FROM production_orders
       WHERE production_date BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const qualityResult = await query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN is_conform = true THEN 1 ELSE 0 END) as conform
       FROM quality_controls
       WHERE control_date BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const reportData = {
      period: `${startDate} - ${endDate}`,
      production: productionResult.rows[0],
      quality: {
        conformityRate: qualityResult.rows[0]?.total > 0
          ? Math.round((parseInt(qualityResult.rows[0].conform) / parseInt(qualityResult.rows[0].total)) * 100)
          : 0
      }
    };

    const pdfBuffer = await PDFService.generateProductionReportPDF(reportData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport-production-${startDate}-${endDate}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

