import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';




export const getSites = async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as total_parcels,
        SUM(p.area_hectares) as total_area_hectares
      FROM agropole_sites s
      LEFT JOIN agropole_parcels p ON s.id = p.site_id
      GROUP BY s.id
      ORDER BY s.name
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getParcels = async (req: Request, res: Response) => {
  try {
    const { site_id, status } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (site_id) {
      params.push(site_id);
      whereClause += ` AND p.site_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      whereClause += ` AND p.status = $${params.length}`;
    }

    const result = await query(`
      SELECT 
        p.*,
        s.name as site_name,
        c.name as current_crop_name,
        c.variety as current_crop_variety
      FROM agropole_parcels p
      LEFT JOIN agropole_sites s ON p.site_id = s.id
      LEFT JOIN agropole_crops c ON p.current_crop_id = c.id
      WHERE ${whereClause}
      ORDER BY p.parcel_number
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const recordCrop = async (req: Request, res: Response) => {
  try {
    const {
      parcel_id,
      crop_type,
      variety,
      sowing_date,
      expected_harvest_date,
      area_hectares,
      notes
    } = req.body;

    const result = await query(`
      INSERT INTO agropole_crops (
        parcel_id, crop_type, variety, sowing_date,
        expected_harvest_date, area_hectares, status, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'growing', $7, NOW())
      RETURNING *
    `, [
      parcel_id,
      crop_type,
      variety,
      sowing_date,
      expected_harvest_date,
      area_hectares,
      notes
    ]);

    
    await query(`
      UPDATE agropole_parcels
      SET current_crop_id = $1, status = 'cultivated'
      WHERE id = $2
    `, [result.rows[0].id, parcel_id]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const recordHarvest = async (req: AuthRequest, res: Response) => {
  try {
    const {
      crop_id,
      harvest_date,
      quantity_kg,
      quality_grade,
      storage_location,
      notes
    } = req.body;

    const result = await query(`
      INSERT INTO agropole_harvests (
        crop_id, harvest_date, quantity_kg, quality_grade,
        storage_location, notes, recorded_by, recorded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `, [
      crop_id,
      harvest_date,
      quantity_kg,
      quality_grade,
      storage_location,
      notes,
      req.user?.id || null
    ]);

    
    await query(`
      UPDATE agropole_crops SET status = 'harvested' WHERE id = $1
    `, [crop_id]);

    
    if (storage_location) {
      
      
    }

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getHarvests = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, crop_type } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause += ` AND h.harvest_date BETWEEN $${params.length - 1} AND $${params.length}`;
    }
    if (crop_type) {
      params.push(crop_type);
      whereClause += ` AND c.crop_type = $${params.length}`;
    }

    const result = await query(`
      SELECT 
        h.*,
        c.crop_type,
        c.variety,
        c.area_hectares,
        p.parcel_number,
        s.name as site_name,
        u.email as recorded_by_email
      FROM agropole_harvests h
      LEFT JOIN agropole_crops c ON h.crop_id = c.id
      LEFT JOIN agropole_parcels p ON c.parcel_id = p.id
      LEFT JOIN agropole_sites s ON p.site_id = s.id
      LEFT JOIN users u ON h.recorded_by = u.id
      WHERE ${whereClause}
      ORDER BY h.harvest_date DESC
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


export const getAgropoleStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    
    const areaStats = await query(`
      SELECT 
        SUM(area_hectares) as total_area_hectares,
        COUNT(*) as total_parcels,
        COUNT(DISTINCT site_id) as total_sites
      FROM agropole_parcels
    `);

    
    const harvestStats = await query(`
      SELECT 
        SUM(h.quantity_kg) / 1000 as total_harvest_tons,
        COUNT(*) as total_harvests,
        AVG(h.quantity_kg / c.area_hectares) as avg_yield_kg_per_hectare
      FROM agropole_harvests h
      LEFT JOIN agropole_crops c ON h.crop_id = c.id
      WHERE h.harvest_date BETWEEN $1 AND $2
    `, [
      startDate || new Date(new Date().setMonth(new Date().getMonth() - 6)),
      endDate || new Date()
    ]);

    
    const currentCropsStats = await query(`
      SELECT 
        crop_type,
        COUNT(*) as count,
        SUM(area_hectares) as total_area
      FROM agropole_crops
      WHERE status IN ('growing', 'planted')
      GROUP BY crop_type
    `);

    res.json({
      success: true,
      data: {
        area: areaStats.rows[0],
        harvests: harvestStats.rows[0],
        current_crops: currentCropsStats.rows
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};





