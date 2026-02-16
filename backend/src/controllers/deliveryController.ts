import { Request, Response } from 'express';
import { query } from '../config/database';




export const getVehicles = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      whereClause += ` AND v.status = $${params.length}`;
    }

    const result = await query(`
      SELECT 
        v.*,
        COUNT(DISTINCT d.id) as total_deliveries,
        SUM(d.distance_km) as total_distance_km,
        SUM(d.fuel_consumed_liters) as total_fuel_liters
      FROM delivery_vehicles v
      LEFT JOIN deliveries d ON v.id = d.vehicle_id
      WHERE ${whereClause}
      GROUP BY v.id
      ORDER BY v.plate_number
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const createDelivery = async (req: Request, res: Response) => {
  try {
    const {
      order_id,
      vehicle_id,
      driver_id,
      items,
      delivery_address,
      estimated_delivery_date,
      estimated_distance_km
    } = req.body;

    const result = await query(`
      INSERT INTO deliveries (
        order_id, vehicle_id, driver_id, items, delivery_address,
        estimated_delivery_date, estimated_distance_km, status, created_at
      ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, 'scheduled', NOW())
      RETURNING *
    `, [
      order_id,
      vehicle_id,
      driver_id,
      JSON.stringify(items),
      delivery_address,
      estimated_delivery_date,
      estimated_distance_km
    ]);

    
    await query(`
      UPDATE sales_orders SET status = 'shipped' WHERE id = $1
    `, [order_id]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const completeDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      actual_distance_km,
      fuel_consumed_liters,
      fuel_cost,
      delivery_time_minutes,
      notes
    } = req.body;

    const delivery = await query(`
      SELECT * FROM deliveries WHERE id = $1
    `, [id]);

    if (delivery.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Livraison non trouvée'
      });
      return;
    }

    const deliveryData = delivery.rows[0];

    
    const totalWeight = deliveryData.items.reduce((sum: number, item: any) => 
      sum + (item.quantity || 0), 0
    );
    const costPerTon = totalWeight > 0 ? (fuel_cost / (totalWeight / 1000)) : 0;

    const result = await query(`
      UPDATE deliveries
      SET 
        actual_distance_km = COALESCE($1, actual_distance_km),
        fuel_consumed_liters = COALESCE($2, fuel_consumed_liters),
        fuel_cost = COALESCE($3, fuel_cost),
        delivery_time_minutes = COALESCE($4, delivery_time_minutes),
        cost_per_ton = $5,
        delivered_at = NOW(),
        status = 'delivered',
        notes = COALESCE($6, notes),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [actual_distance_km, fuel_consumed_liters, fuel_cost, delivery_time_minutes, costPerTon, notes, id]);

    
    await query(`
      UPDATE sales_orders SET status = 'delivered' WHERE id = $1
    `, [deliveryData.order_id]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getDeliveries = async (req: Request, res: Response) => {
  try {
    const { status, vehicle_id, driver_id, startDate, endDate } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      whereClause += ` AND d.status = $${params.length}`;
    }
    if (vehicle_id) {
      params.push(vehicle_id);
      whereClause += ` AND d.vehicle_id = $${params.length}`;
    }
    if (driver_id) {
      params.push(driver_id);
      whereClause += ` AND d.driver_id = $${params.length}`;
    }
    if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause += ` AND d.created_at BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    const result = await query(`
      SELECT 
        d.*,
        v.plate_number,
        v.vehicle_type,
        u.first_name || ' ' || u.last_name as driver_name,
        so.customer_id,
        c.name as customer_name
      FROM deliveries d
      LEFT JOIN delivery_vehicles v ON d.vehicle_id = v.id
      LEFT JOIN users u ON d.driver_id = u.id
      LEFT JOIN sales_orders so ON d.order_id = so.id
      LEFT JOIN customers c ON so.customer_id = c.id
      WHERE ${whereClause}
      ORDER BY d.created_at DESC
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


export const getDeliveryStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    
    const efficiencyStats = await query(`
      SELECT 
        COUNT(*) as total_deliveries,
        SUM(actual_distance_km) as total_distance_km,
        SUM(fuel_consumed_liters) as total_fuel_liters,
        AVG(actual_distance_km) as avg_distance_km,
        AVG(fuel_consumed_liters) as avg_fuel_liters,
        AVG(cost_per_ton) as avg_cost_per_ton,
        AVG(delivery_time_minutes) as avg_delivery_time_minutes
      FROM deliveries
      WHERE status = 'delivered'
        AND delivered_at BETWEEN $1 AND $2
    `, [
      startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate || new Date()
    ]);

    
    const serviceRate = await query(`
      SELECT 
        COUNT(*) as total_deliveries,
        SUM(CASE WHEN delivered_at <= estimated_delivery_date THEN 1 ELSE 0 END) as on_time_deliveries,
        ROUND(
          (SUM(CASE WHEN delivered_at <= estimated_delivery_date THEN 1 ELSE 0 END)::float / 
           NULLIF(COUNT(*), 0)) * 100, 
          2
        ) as service_rate
      FROM deliveries
      WHERE status = 'delivered'
        AND delivered_at BETWEEN $1 AND $2
    `, [
      startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate || new Date()
    ]);

    res.json({
      success: true,
      data: {
        efficiency: efficiencyStats.rows[0],
        service: serviceRate.rows[0]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};





