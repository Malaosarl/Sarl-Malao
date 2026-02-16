import { Request, Response } from 'express';
import { query } from '../config/database';




export const calculateProductionCost = async (req: Request, res: Response) => {
  try {
    const { order_id, startDate, endDate } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (order_id) {
      params.push(order_id);
      whereClause = `po.id = $${params.length}`;
    } else if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause = `po.production_date BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    const result = await query(`
      SELECT 
        po.id as order_id,
        po.quantity_produced,
        po.production_date,
        p.name as product_name,
        COALESCE(po.raw_material_cost, 0) as raw_material_cost,
        COALESCE(po.labor_cost, 0) as labor_cost,
        COALESCE(po.energy_cost, 0) as energy_cost,
        COALESCE(po.maintenance_cost, 0) as maintenance_cost,
        COALESCE(po.other_costs, 0) as other_costs
      FROM production_orders po
      LEFT JOIN products p ON po.product_id = p.id
      WHERE ${whereClause}
        AND po.status = 'completed'
        AND po.quantity_produced > 0
    `, params);

    
    const costsWithTotals = result.rows.map((row: any) => {
      const totalCost = 
        parseFloat(row.raw_material_cost || 0) +
        parseFloat(row.labor_cost || 0) +
        parseFloat(row.energy_cost || 0) +
        parseFloat(row.maintenance_cost || 0) +
        parseFloat(row.other_costs || 0);

      const costPerTon = totalCost / (parseFloat(row.quantity_produced) / 1000);

      return {
        ...row,
        total_cost: totalCost,
        cost_per_ton: costPerTon
      };
    });

    res.json({
      success: true,
      data: costsWithTotals
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getProfitability = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, product_id } = req.query;

    let whereClause = 'po.status = \'completed\'';
    const params: any[] = [];

    if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause += ` AND po.production_date BETWEEN $${params.length - 1} AND $${params.length}`;
    }
    if (product_id) {
      params.push(product_id);
      whereClause += ` AND po.product_id = $${params.length}`;
    }

    const result = await query(`
      SELECT 
        po.product_id,
        p.name as product_name,
        SUM(po.quantity_produced) as total_produced_kg,
        SUM(
          COALESCE(po.raw_material_cost, 0) +
          COALESCE(po.labor_cost, 0) +
          COALESCE(po.energy_cost, 0) +
          COALESCE(po.maintenance_cost, 0) +
          COALESCE(po.other_costs, 0)
        ) as total_cost,
        SUM(so.total_amount) as total_revenue
      FROM production_orders po
      LEFT JOIN products p ON po.product_id = p.id
      LEFT JOIN sales_orders so ON po.product_id = (
        SELECT (item->>'product_id')::int
        FROM jsonb_array_elements(so.items) item
        LIMIT 1
      )
      WHERE ${whereClause}
      GROUP BY po.product_id, p.name
    `, params);

    
    const profitability = result.rows.map((row: any) => {
      const totalCost = parseFloat(row.total_cost || 0);
      const totalRevenue = parseFloat(row.total_revenue || 0);
      const grossMargin = totalRevenue - totalCost;
      const grossMarginRate = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
      const profitabilityRate = totalCost > 0 ? (grossMargin / totalCost) * 100 : 0;

      return {
        ...row,
        gross_margin: grossMargin,
        gross_margin_rate: grossMarginRate,
        profitability_rate: profitabilityRate
      };
    });

    res.json({
      success: true,
      data: profitability
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getCostEvolution = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;

    let dateFormat = 'YYYY-MM';
    if (period === 'week') {
      dateFormat = 'IYYY-IW';
    } else if (period === 'day') {
      dateFormat = 'YYYY-MM-DD';
    }

    const result = await query(`
      SELECT 
        TO_CHAR(po.production_date, $1) as period,
        AVG(
          (
            COALESCE(po.raw_material_cost, 0) +
            COALESCE(po.labor_cost, 0) +
            COALESCE(po.energy_cost, 0)
          ) / NULLIF(po.quantity_produced / 1000, 0)
        ) as avg_cost_per_ton,
        SUM(po.quantity_produced) / 1000 as total_produced_tons
      FROM production_orders po
      WHERE po.status = 'completed'
        AND po.production_date BETWEEN $2 AND $3
      GROUP BY period
      ORDER BY period
    `, [
      dateFormat,
      startDate || new Date(new Date().setMonth(new Date().getMonth() - 6)),
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


export const getCostBreakdown = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(`
      SELECT 
        SUM(COALESCE(po.raw_material_cost, 0)) as raw_material_cost,
        SUM(COALESCE(po.labor_cost, 0)) as labor_cost,
        SUM(COALESCE(po.energy_cost, 0)) as energy_cost,
        SUM(COALESCE(po.maintenance_cost, 0)) as maintenance_cost
      FROM production_orders po
      WHERE po.status = 'completed'
        AND po.production_date BETWEEN $1 AND $2
    `, [
      startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate || new Date()
    ]);

    const breakdown = result.rows[0];
    const total = 
      parseFloat(breakdown.raw_material_cost || 0) +
      parseFloat(breakdown.labor_cost || 0) +
      parseFloat(breakdown.energy_cost || 0) +
      parseFloat(breakdown.maintenance_cost || 0);

    res.json({
      success: true,
      data: {
        ...breakdown,
        total_cost: total,
        percentages: {
          raw_material: total > 0 ? (parseFloat(breakdown.raw_material_cost || 0) / total) * 100 : 0,
          labor: total > 0 ? (parseFloat(breakdown.labor_cost || 0) / total) * 100 : 0,
          energy: total > 0 ? (parseFloat(breakdown.energy_cost || 0) / total) * 100 : 0,
          maintenance: total > 0 ? (parseFloat(breakdown.maintenance_cost || 0) / total) * 100 : 0
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};





