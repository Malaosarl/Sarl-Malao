import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';




export const getInventory = async (req: Request, res: Response) => {
  try {
    const { type, low_stock_only } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (type) {
      params.push(type);
      whereClause += ` AND i.type = $${params.length}`;
    }

    const result = await query(`
      SELECT 
        i.*,
        COALESCE(SUM(s.quantity), 0) as current_stock,
        COALESCE(AVG(s.unit_price), 0) as average_price,
        CASE 
          WHEN COALESCE(SUM(s.quantity), 0) <= i.min_stock_level THEN true
          ELSE false
        END as is_low_stock,
        CASE 
          WHEN i.max_stock_level > 0 THEN 
            ROUND((COALESCE(SUM(s.quantity), 0)::float / i.max_stock_level) * 100, 2)
          ELSE 0
        END as stock_percentage,
        ROUND(
          (COALESCE(SUM(s.quantity), 0) * COALESCE(AVG(s.unit_price), 0)) / 
          NULLIF(SUM(COALESCE(s.quantity, 0)), 0), 
          2
        ) as stock_value
      FROM inventory_items i
      LEFT JOIN inventory_stock_movements s ON i.id = s.item_id 
        AND s.type = 'in' AND s.status = 'completed'
      WHERE ${whereClause}
      GROUP BY i.id
      ${low_stock_only === 'true' ? 'HAVING COALESCE(SUM(s.quantity), 0) <= i.min_stock_level' : ''}
      ORDER BY i.name
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const recordStockEntry = async (req: AuthRequest, res: Response) => {
  try {
    const {
      item_id,
      quantity,
      unit_price,
      lot_number,
      expiry_date,
      supplier_id,
      invoice_number,
      notes
    } = req.body;

    const result = await query(`
      INSERT INTO inventory_stock_movements (
        item_id, type, quantity, unit_price, lot_number,
        expiry_date, supplier_id, invoice_number, notes,
        created_by, created_at, status
      ) VALUES ($1, 'in', $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'completed')
      RETURNING *
    `, [
      item_id, quantity, unit_price, lot_number,
      expiry_date, supplier_id, invoice_number, notes, req.user?.id || null
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const recordStockExit = async (req: AuthRequest, res: Response) => {
  try {
    const {
      item_id,
      quantity,
      lot_number,
      order_id,
      destination,
      notes
    } = req.body;

    
    const stockCheck = await query(`
      SELECT COALESCE(SUM(quantity), 0) as available_stock
      FROM inventory_stock_movements
      WHERE item_id = $1 AND type = 'in' AND status = 'completed'
    `, [item_id]);

    const availableStock = parseFloat(stockCheck.rows[0].available_stock);

    if (availableStock < quantity) {
      res.status(400).json({
        success: false,
        error: `Stock insuffisant. Disponible: ${availableStock}, Demandé: ${quantity}`
      });
      return;
    }

    const result = await query(`
      INSERT INTO inventory_stock_movements (
        item_id, type, quantity, lot_number,
        order_id, destination, notes,
        created_by, created_at, status
      ) VALUES ($1, 'out', $2, $3, $4, $5, $6, $7, NOW(), 'completed')
      RETURNING *
    `, [
      item_id, quantity, lot_number, order_id, destination, notes, req.user?.id || null
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const performInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { item_id, counted_quantity, notes } = req.body;

    
    const theoreticalStock = await query(`
      SELECT COALESCE(SUM(
        CASE WHEN type = 'in' THEN quantity ELSE -quantity END
      ), 0) as theoretical_stock
      FROM inventory_stock_movements
      WHERE item_id = $1 AND status = 'completed'
    `, [item_id]);

    const theoretical = parseFloat(theoreticalStock.rows[0].theoretical_stock);
    const difference = counted_quantity - theoretical;

    const result = await query(`
      INSERT INTO inventory_counts (
        item_id, theoretical_quantity, counted_quantity, difference, notes, counted_by, counted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [item_id, theoretical, counted_quantity, difference, notes, req.user?.id || null]);

    
    if (difference !== 0) {
      await query(`
        INSERT INTO inventory_stock_movements (
          item_id, type, quantity, notes, created_by, created_at, status
        ) VALUES ($1, $2, $3, 'Régularisation inventaire', $4, NOW(), 'completed')
      `, [
        item_id,
        difference > 0 ? 'in' : 'out',
        Math.abs(difference),
        req.user?.id || null
      ]);
    }

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getLowStockAlerts = async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        i.*,
        COALESCE(SUM(s.quantity), 0) as current_stock,
        i.min_stock_level - COALESCE(SUM(s.quantity), 0) as quantity_needed,
        CASE 
          WHEN COALESCE(SUM(s.quantity), 0) = 0 THEN 'critical'
          WHEN COALESCE(SUM(s.quantity), 0) <= i.min_stock_level THEN 'low'
          ELSE 'normal'
        END as alert_level
      FROM inventory_items i
      LEFT JOIN inventory_stock_movements s ON i.id = s.item_id 
        AND s.type = 'in' AND s.status = 'completed'
      GROUP BY i.id
      HAVING COALESCE(SUM(s.quantity), 0) <= i.min_stock_level
      ORDER BY 
        CASE 
          WHEN COALESCE(SUM(s.quantity), 0) = 0 THEN 1
          ELSE 2
        END,
        current_stock ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getStockRotation = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(`
      SELECT 
        i.id,
        i.name,
        i.type,
        AVG(
          (SELECT COALESCE(SUM(quantity), 0) 
           FROM inventory_stock_movements 
           WHERE item_id = i.id AND type = 'in' AND status = 'completed'
           AND created_at <= sm.created_at)
        ) as avg_stock,
        SUM(CASE WHEN sm.type = 'out' THEN sm.quantity ELSE 0 END) as total_out,
        CASE 
          WHEN AVG((SELECT COALESCE(SUM(quantity), 0) 
                    FROM inventory_stock_movements 
                    WHERE item_id = i.id AND type = 'in' AND status = 'completed'
                    AND created_at <= sm.created_at)) > 0 THEN
            ROUND(
              (SUM(CASE WHEN sm.type = 'out' THEN sm.quantity ELSE 0 END)::float / 
               AVG((SELECT COALESCE(SUM(quantity), 0) 
                     FROM inventory_stock_movements 
                     WHERE item_id = i.id AND type = 'in' AND status = 'completed'
                     AND created_at <= sm.created_at))) * 365 / 
              EXTRACT(DAY FROM ($2::date - $1::date)), 
              2
            )
          ELSE 0
        END as rotation_rate
      FROM inventory_items i
      LEFT JOIN inventory_stock_movements sm ON i.id = sm.item_id
        AND sm.created_at BETWEEN $1 AND $2 AND sm.status = 'completed'
      GROUP BY i.id, i.name, i.type
      HAVING SUM(CASE WHEN sm.type = 'out' THEN sm.quantity ELSE 0 END) > 0
      ORDER BY rotation_rate DESC
    `, [
      startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate || new Date()
    ]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getLotTraceability = async (req: Request, res: Response) => {
  try {
    const { lot_number } = req.params;

    const result = await query(`
      SELECT 
        sm.*,
        i.name as item_name,
        i.type as item_type,
        u.email as created_by_email,
        po.id as production_order_id,
        p.name as product_name
      FROM inventory_stock_movements sm
      JOIN inventory_items i ON sm.item_id = i.id
      LEFT JOIN users u ON sm.created_by = u.id
      LEFT JOIN production_orders po ON sm.order_id = po.id
      LEFT JOIN products p ON po.product_id = p.id
      WHERE sm.lot_number = $1
      ORDER BY sm.created_at ASC
    `, [lot_number]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};





