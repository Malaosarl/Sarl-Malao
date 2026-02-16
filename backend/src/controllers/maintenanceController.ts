import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';




export const getAssets = async (req: Request, res: Response) => {
  try {
    const { status, category } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      whereClause += ` AND a.status = $${params.length}`;
    }
    if (category) {
      params.push(category);
      whereClause += ` AND a.category = $${params.length}`;
    }

    const result = await query(`
      SELECT 
        a.*,
        COUNT(DISTINCT mi.id) as total_interventions,
        MAX(mi.intervention_date) as last_intervention_date
      FROM maintenance_assets a
      LEFT JOIN maintenance_interventions mi ON a.id = mi.asset_id
      WHERE ${whereClause}
      GROUP BY a.id
      ORDER BY a.name
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const createIntervention = async (req: AuthRequest, res: Response) => {
  try {
    const {
      asset_id,
      intervention_type,
      scheduled_date,
      description,
      parts_used,
      labor_hours,
      labor_cost_per_hour,
      parts_cost,
      total_cost,
      technician_id,
      related_order_id
    } = req.body;

    const result = await query(`
      INSERT INTO maintenance_interventions (
        asset_id, intervention_type, scheduled_date, description,
        parts_used, labor_hours, labor_cost_per_hour, parts_cost,
        total_cost, technician_id, related_order_id, status, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, 'scheduled', $12, NOW())
      RETURNING *
    `, [
      asset_id,
      intervention_type,
      scheduled_date,
      description,
      JSON.stringify(parts_used || []),
      labor_hours,
      labor_cost_per_hour,
      parts_cost,
      total_cost,
      technician_id,
      related_order_id,
      req.user?.id || null
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const completeIntervention = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      actual_labor_hours,
      actual_parts_cost,
      actual_total_cost,
      notes,
      next_maintenance_date
    } = req.body;

    const result = await query(`
      UPDATE maintenance_interventions
      SET 
        actual_labor_hours = COALESCE($1, actual_labor_hours),
        actual_parts_cost = COALESCE($2, actual_parts_cost),
        actual_total_cost = COALESCE($3, actual_total_cost),
        notes = COALESCE($4, notes),
        next_maintenance_date = COALESCE($5, next_maintenance_date),
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [actual_labor_hours, actual_parts_cost, actual_total_cost, notes, next_maintenance_date, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Intervention non trouvée'
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


export const getInterventions = async (req: Request, res: Response) => {
  try {
    const { status, intervention_type, asset_id, startDate, endDate } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      whereClause += ` AND mi.status = $${params.length}`;
    }
    if (intervention_type) {
      params.push(intervention_type);
      whereClause += ` AND mi.intervention_type = $${params.length}`;
    }
    if (asset_id) {
      params.push(asset_id);
      whereClause += ` AND mi.asset_id = $${params.length}`;
    }
    if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause += ` AND mi.scheduled_date BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    const result = await query(`
      SELECT 
        mi.*,
        a.name as asset_name,
        a.category as asset_category,
        u.email as technician_email
      FROM maintenance_interventions mi
      LEFT JOIN maintenance_assets a ON mi.asset_id = a.id
      LEFT JOIN users u ON mi.technician_id = u.id
      WHERE ${whereClause}
      ORDER BY mi.scheduled_date DESC
      LIMIT 100
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getMaintenanceKPIs = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    
    const availabilityStats = await query(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(CASE WHEN status = 'operational' THEN 1 ELSE 0 END) as operational_assets,
        ROUND(
          (SUM(CASE WHEN status = 'operational' THEN 1 ELSE 0 END)::float / 
           NULLIF(COUNT(*), 0)) * 100, 
          2
        ) as availability_rate
      FROM maintenance_assets
    `);

    
    const costStats = await query(`
      SELECT 
        SUM(COALESCE(actual_total_cost, total_cost, 0)) as total_maintenance_cost,
        COUNT(*) as total_interventions
      FROM maintenance_interventions
      WHERE scheduled_date BETWEEN $1 AND $2
    `, [
      startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate || new Date()
    ]);

    res.json({
      success: true,
      data: {
        availability: availabilityStats.rows[0],
        costs: costStats.rows[0]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getPreventiveSchedule = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(`
      SELECT 
        a.id as asset_id,
        a.name as asset_name,
        a.category,
        mi.next_maintenance_date,
        EXTRACT(DAY FROM (mi.next_maintenance_date - CURRENT_DATE)) as days_until_maintenance
      FROM maintenance_assets a
      LEFT JOIN LATERAL (
        SELECT next_maintenance_date
        FROM maintenance_interventions
        WHERE asset_id = a.id
          AND intervention_type = 'preventive'
        ORDER BY next_maintenance_date ASC
        LIMIT 1
      ) mi ON true
      WHERE mi.next_maintenance_date BETWEEN $1 AND $2
        OR mi.next_maintenance_date < CURRENT_DATE
      ORDER BY mi.next_maintenance_date ASC
    `, [
      startDate || new Date(),
      endDate || new Date(new Date().setMonth(new Date().getMonth() + 3))
    ]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};





