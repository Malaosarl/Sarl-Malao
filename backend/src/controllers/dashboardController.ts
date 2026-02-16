import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getDashboardData = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    
    const productionResult = await query(
      `SELECT COALESCE(SUM(actual_quantity), 0) as total_production
       FROM production_orders
       WHERE DATE(created_at) = CURRENT_DATE
       AND status = 'completed'`
    );
    const productionToday = parseFloat(productionResult.rows[0]?.total_production || '0');

    
    const plannedResult = await query(
      `SELECT COALESCE(SUM(planned_quantity), 0) as total_planned
       FROM production_orders
       WHERE DATE(start_date) = CURRENT_DATE
       AND status IN ('planned', 'in_progress', 'completed')`
    );
    const productionPlanned = parseFloat(plannedResult.rows[0]?.total_planned || '1');
    const productionRate = productionPlanned > 0 
      ? Math.round((productionToday / productionPlanned) * 100) 
      : 0;

    
    const qualityResult = await query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN is_conform = true THEN 1 ELSE 0 END) as conform
       FROM quality_controls
       WHERE control_date >= CURRENT_DATE - INTERVAL '30 days'`
    );
    const qualityData = qualityResult.rows[0];
    const conformityRate = qualityData?.total > 0
      ? Math.round((parseInt(qualityData.conform) / parseInt(qualityData.total)) * 100)
      : 0;

    
    const ordersResult = await query(
      `SELECT COUNT(*) as count
       FROM orders
       WHERE status IN ('pending', 'confirmed', 'in_production', 'ready')`
    );
    const ordersCount = parseInt(ordersResult.rows[0]?.count || '0');

    
    const stockResult = await query(
      `SELECT COALESCE(SUM(quantity), 0) as total_stock
       FROM inventory_stocks
       WHERE item_type = 'product'`
    );
    const stockTotal = parseFloat(stockResult.rows[0]?.total_stock || '0');

    res.json({
      success: true,
      data: {
        production: {
          today: productionToday,
          planned: productionPlanned,
          rate: productionRate,
          unit: 't'
        },
        quality: {
          conformityRate,
          unit: '%'
        },
        orders: {
          pending: ordersCount,
          unit: 'commandes'
        },
        stock: {
          total: stockTotal,
          unit: 't'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};








