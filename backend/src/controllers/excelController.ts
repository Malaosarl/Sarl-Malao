import { Response } from 'express';
import { ExcelService } from '../services/excelService';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';


export const exportProduction = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(
      `SELECT po.*, p.name as product_name
       FROM production_orders po
       LEFT JOIN products p ON po.product_id = p.id
       WHERE po.production_date BETWEEN $1 AND $2
       ORDER BY po.production_date DESC`,
      [startDate || new Date(new Date().setDate(new Date().getDate() - 30)), endDate || new Date()]
    );

    const buffer = await ExcelService.exportProductionData(result.rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="production-${startDate}-${endDate}.xlsx"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const exportInventory = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT i.*, COALESCE(SUM(s.quantity), 0) as current_stock
       FROM inventory_items i
       LEFT JOIN inventory_stock_movements s ON i.id = s.item_id AND s.type = 'in'
       GROUP BY i.id
       ORDER BY i.name`
    );

    const buffer = await ExcelService.exportInventoryData(result.rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="stocks.xlsx"');
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const exportSales = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(
      `SELECT o.*, c.name as client_name
       FROM orders o
       LEFT JOIN clients c ON o.client_id = c.id
       WHERE o.order_date BETWEEN $1 AND $2
       ORDER BY o.order_date DESC`,
      [startDate || new Date(new Date().setDate(new Date().getDate() - 30)), endDate || new Date()]
    );

    const buffer = await ExcelService.exportSalesData(result.rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="ventes-${startDate}-${endDate}.xlsx"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

