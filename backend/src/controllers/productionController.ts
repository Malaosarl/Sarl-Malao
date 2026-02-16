import { Request, Response } from 'express';
import { query, pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';




export const getProductionPlanning = async (req: Request, res: Response) => {
  try {
    const { period = 'day', startDate, endDate } = req.query;
    
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `WHERE production_date BETWEEN $1 AND $2`;
    }

    const result = await query(`
      SELECT 
        production_date,
        SUM(quantity_produced) as total_quantity,
        SUM(quantity_planned) as total_planned,
        AVG(production_rate) as avg_rate,
        COUNT(*) as number_of_orders
      FROM production_orders
      ${dateFilter}
      GROUP BY production_date
      ORDER BY production_date DESC
      LIMIT 100
    `, startDate && endDate ? [startDate, endDate] : []);

    res.json({
      success: true,
      period,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const createProductionOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      product_id,
      quantity_planned,
      formula_id,
      scheduled_date,
      team_id
    } = req.body;

    const result = await query(`
      INSERT INTO production_orders (
        product_id, quantity_planned, formula_id, 
        scheduled_date, team_id, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, 'planned', $6)
      RETURNING *
    `, [product_id, quantity_planned, formula_id, scheduled_date, team_id, req.user?.id || null]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const recordProduction = async (req: Request, res: Response) => {
  try {
    const { order_id, quantity_produced, raw_materials_used, downtime_reasons } = req.body;

    
    const result = await query(`
      UPDATE production_orders
      SET 
        quantity_produced = $1,
        production_date = NOW(),
        status = 'completed',
        raw_materials_used = $2::jsonb,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [quantity_produced, JSON.stringify(raw_materials_used), order_id]);

    
    if (downtime_reasons && downtime_reasons.length > 0) {
      for (const downtime of downtime_reasons) {
        await query(`
          INSERT INTO production_downtimes (
            order_id, reason, duration_minutes, description
          ) VALUES ($1, $2, $3, $4)
        `, [order_id, downtime.reason, downtime.duration, downtime.description]);
      }
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getProductionKPIs = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    
    const productionStats = await query(`
      SELECT 
        SUM(quantity_produced) as total_produced,
        SUM(quantity_planned) as total_planned,
        COUNT(*) as total_orders,
        AVG((quantity_produced::float / NULLIF(quantity_planned, 0)) * 100) as achievement_rate
      FROM production_orders
      WHERE production_date BETWEEN $1 AND $2
    `, [startDate || new Date(new Date().setDate(new Date().getDate() - 30)), endDate || new Date()]);

    
    const yieldStats = await query(`
      SELECT 
        AVG(yield_percentage) as avg_yield,
        AVG(efficiency_rate) as avg_efficiency
      FROM production_metrics
      WHERE date BETWEEN $1 AND $2
    `, [startDate || new Date(new Date().setDate(new Date().getDate() - 30)), endDate || new Date()]);

    
    const energyStats = await query(`
      SELECT 
        AVG(energy_consumption_kwh_per_ton) as avg_energy,
        SUM(total_energy_kwh) as total_energy,
        AVG(co2_emissions_kg_per_ton) as avg_co2,
        AVG(water_consumption_m3_per_ton) as avg_water
      FROM production_energy
      WHERE date BETWEEN $1 AND $2
    `, [startDate || new Date(new Date().setDate(new Date().getDate() - 30)), endDate || new Date()]);

    res.json({
      success: true,
      data: {
        production: productionStats.rows[0],
        yield: yieldStats.rows[0],
        energy: energyStats.rows[0]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getFormulas = async (req: Request, res: Response) => {
  try {
    const { product_id, version } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (product_id) {
      params.push(product_id);
      whereClause += ` AND product_id = $${params.length}`;
    }
    if (version) {
      params.push(version);
      whereClause += ` AND version = $${params.length}`;
    }

    const result = await query(`
      SELECT f.*, 
        json_agg(
          json_build_object(
            'raw_material_id', fi.raw_material_id,
            'raw_material_name', rm.name,
            'percentage', fi.percentage,
            'quantity_kg', fi.quantity_kg
          )
        ) as ingredients
      FROM production_formulas f
      LEFT JOIN production_formula_ingredients fi ON f.id = fi.formula_id
      LEFT JOIN raw_materials rm ON fi.raw_material_id = rm.id
      WHERE ${whereClause}
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const createFormula = async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, name, version, ingredients, is_active } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      
      const formulaResult = await client.query(`
        INSERT INTO production_formulas (
          product_id, name, version, is_active, created_by
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [product_id, name, version, is_active !== false, req.user?.id || null]);

      const formulaId = formulaResult.rows[0].id;

      
      for (const ingredient of ingredients) {
        await client.query(`
          INSERT INTO production_formula_ingredients (
            formula_id, raw_material_id, percentage, quantity_kg
          ) VALUES ($1, $2, $3, $4)
        `, [formulaId, ingredient.raw_material_id, ingredient.percentage, ingredient.quantity_kg]);
      }

      await client.query('COMMIT');
      client.release();

      res.status(201).json({
        success: true,
        data: formulaResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getDowntimes = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(`
      SELECT 
        pd.*,
        po.product_id,
        p.name as product_name,
        po.quantity_planned
      FROM production_downtimes pd
      JOIN production_orders po ON pd.order_id = po.id
      JOIN products p ON po.product_id = p.id
      WHERE pd.created_at BETWEEN $1 AND $2
      ORDER BY pd.created_at DESC
    `, [startDate || new Date(new Date().setDate(new Date().getDate() - 30)), endDate || new Date()]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const recordEnergyData = async (req: Request, res: Response) => {
  try {
    const {
      order_id,
      energy_consumption_kwh,
      energy_consumption_kwh_per_ton,
      co2_emissions_kg,
      co2_emissions_kg_per_ton,
      water_consumption_m3,
      water_consumption_m3_per_ton,
      renewable_energy_percentage,
      waste_valorization_percentage
    } = req.body;

    const result = await query(`
      INSERT INTO production_energy (
        order_id, date, energy_consumption_kwh, energy_consumption_kwh_per_ton,
        co2_emissions_kg, co2_emissions_kg_per_ton,
        water_consumption_m3, water_consumption_m3_per_ton,
        renewable_energy_percentage, waste_valorization_percentage
      ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      order_id, energy_consumption_kwh, energy_consumption_kwh_per_ton,
      co2_emissions_kg, co2_emissions_kg_per_ton,
      water_consumption_m3, water_consumption_m3_per_ton,
      renewable_energy_percentage, waste_valorization_percentage
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
