import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';




export const createQualityControl = async (req: AuthRequest, res: Response) => {
  try {
    const {
      order_id,
      lot_number,
      control_type,
      parameters,
      results,
      is_compliant,
      tested_by
    } = req.body;

    const result = await query(`
      INSERT INTO quality_controls (
        order_id, lot_number, control_type, parameters, 
        results, is_compliant, tested_by, tested_at
      ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, NOW())
      RETURNING *
    `, [
      order_id, lot_number, control_type,
      JSON.stringify(parameters), JSON.stringify(results),
      is_compliant, tested_by || req.user?.id || null
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getQualityControls = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, is_compliant, lot_number } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause += ` AND qc.tested_at BETWEEN $${params.length - 1} AND $${params.length}`;
    }
    if (is_compliant !== undefined) {
      params.push(is_compliant === 'true');
      whereClause += ` AND qc.is_compliant = $${params.length}`;
    }
    if (lot_number) {
      params.push(lot_number);
      whereClause += ` AND qc.lot_number = $${params.length}`;
    }

    const result = await query(`
      SELECT 
        qc.*,
        po.product_id,
        p.name as product_name,
        u.email as tester_email
      FROM quality_controls qc
      LEFT JOIN production_orders po ON qc.order_id = po.id
      LEFT JOIN products p ON po.product_id = p.id
      LEFT JOIN users u ON qc.tested_by = u.id
      WHERE ${whereClause}
      ORDER BY qc.tested_at DESC
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


export const createNonConformity = async (req: AuthRequest, res: Response) => {
  try {
    const {
      control_id,
      order_id,
      lot_number,
      description,
      severity,
      category,
      root_cause_analysis,
      corrective_action,
      preventive_action,
      status
    } = req.body;

    const result = await query(`
      INSERT INTO quality_non_conformities (
        control_id, order_id, lot_number, description, severity, category,
        root_cause_analysis, corrective_action, preventive_action, status,
        reported_by, reported_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `, [
      control_id, order_id, lot_number, description, severity, category,
      root_cause_analysis, corrective_action, preventive_action,
      status || 'open', req.user?.id || null
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getNonConformities = async (req: Request, res: Response) => {
  try {
    const { status, severity, category, startDate, endDate } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      whereClause += ` AND nc.status = $${params.length}`;
    }
    if (severity) {
      params.push(severity);
      whereClause += ` AND nc.severity = $${params.length}`;
    }
    if (category) {
      params.push(category);
      whereClause += ` AND nc.category = $${params.length}`;
    }
    if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause += ` AND nc.reported_at BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    const result = await query(`
      SELECT 
        nc.*,
        po.product_id,
        p.name as product_name,
        u.email as reporter_email
      FROM quality_non_conformities nc
      LEFT JOIN production_orders po ON nc.order_id = po.id
      LEFT JOIN products p ON po.product_id = p.id
      LEFT JOIN users u ON nc.reported_by = u.id
      WHERE ${whereClause}
      ORDER BY nc.reported_at DESC
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getConformityRate = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(`
      SELECT 
        COUNT(*) as total_controls,
        SUM(CASE WHEN is_compliant THEN 1 ELSE 0 END) as compliant_count,
        SUM(CASE WHEN NOT is_compliant THEN 1 ELSE 0 END) as non_compliant_count,
        ROUND(
          (SUM(CASE WHEN is_compliant THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0)) * 100, 
          2
        ) as conformity_rate
      FROM quality_controls
      WHERE tested_at BETWEEN $1 AND $2
    `, [
      startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate || new Date()
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getNonConformityPareto = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await query(`
      SELECT 
        category,
        COUNT(*) as count,
        ROUND((COUNT(*)::float / NULLIF((SELECT COUNT(*) FROM quality_non_conformities 
          WHERE reported_at BETWEEN $1 AND $2), 0)) * 100, 2) as percentage
      FROM quality_non_conformities
      WHERE reported_at BETWEEN $1 AND $2
      GROUP BY category
      ORDER BY count DESC
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


export const updateNonConformity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      root_cause_analysis,
      corrective_action,
      preventive_action,
      status,
      closed_by,
      closed_at
    } = req.body;

    const result = await query(`
      UPDATE quality_non_conformities
      SET 
        root_cause_analysis = COALESCE($1, root_cause_analysis),
        corrective_action = COALESCE($2, corrective_action),
        preventive_action = COALESCE($3, preventive_action),
        status = COALESCE($4, status),
        closed_by = COALESCE($5, closed_by),
        closed_at = COALESCE($6, closed_at),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [root_cause_analysis, corrective_action, preventive_action, status, closed_by, closed_at, id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Non-conformité non trouvée'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};





