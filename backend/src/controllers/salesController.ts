import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';




export const createQuote = async (req: AuthRequest, res: Response) => {
  try {
    const {
      customer_id,
      items,
      validity_days = 30,
      notes,
      delivery_address
    } = req.body;

    
    let total = 0;
    for (const item of items) {
      total += item.quantity * item.unit_price;
    }

    const result = await query(`
      INSERT INTO sales_quotes (
        customer_id, items, total_amount, validity_days,
        notes, delivery_address, status, created_by, created_at
      ) VALUES ($1, $2::jsonb, $3, $4, $5, $6, 'draft', $7, NOW())
      RETURNING *
    `, [
      customer_id,
      JSON.stringify(items),
      total,
      validity_days,
      notes,
      delivery_address,
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


export const getQuotes = async (req: Request, res: Response) => {
  try {
    const { status, customer_id, startDate, endDate } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      whereClause += ` AND sq.status = $${params.length}`;
    }
    if (customer_id) {
      params.push(customer_id);
      whereClause += ` AND sq.customer_id = $${params.length}`;
    }
    if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause += ` AND sq.created_at BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    const result = await query(`
      SELECT 
        sq.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        u.email as created_by_email
      FROM sales_quotes sq
      LEFT JOIN customers c ON sq.customer_id = c.id
      LEFT JOIN users u ON sq.created_by = u.id
      WHERE ${whereClause}
      ORDER BY sq.created_at DESC
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


export const convertQuoteToOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { quote_id } = req.params;

    
    const quoteResult = await query(`
      SELECT * FROM sales_quotes WHERE id = $1
    `, [quote_id]);

    if (quoteResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Devis non trouvé'
      });
      return;
    }

    const quote = quoteResult.rows[0];

    
    const orderResult = await query(`
      INSERT INTO sales_orders (
        quote_id, customer_id, items, total_amount,
        delivery_address, status, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())
      RETURNING *
    `, [
      quote_id,
      quote.customer_id,
      quote.items,
      quote.total_amount,
      quote.delivery_address,
      req.user?.id || null
    ]);

    
    await query(`
      UPDATE sales_quotes SET status = 'converted' WHERE id = $1
    `, [quote_id]);

    res.status(201).json({
      success: true,
      data: orderResult.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, customer_id, startDate, endDate } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      whereClause += ` AND so.status = $${params.length}`;
    }
    if (customer_id) {
      params.push(customer_id);
      whereClause += ` AND so.customer_id = $${params.length}`;
    }
    if (startDate && endDate) {
      params.push(startDate, endDate);
      whereClause += ` AND so.created_at BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    const result = await query(`
      SELECT 
        so.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        d.id as delivery_id,
        d.status as delivery_status,
        d.delivered_at
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN deliveries d ON so.id = d.order_id
      WHERE ${whereClause}
      ORDER BY so.created_at DESC
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


export const getSalesStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    
    const revenueStats = await query(`
      SELECT 
        SUM(total_amount) as total_revenue,
        COUNT(*) as total_orders,
        AVG(total_amount) as avg_order_value,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM sales_orders
      WHERE status = 'completed' 
        AND created_at BETWEEN $1 AND $2
    `, [
      startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate || new Date()
    ]);

    
    const serviceStats = await query(`
      SELECT 
        COUNT(*) as total_deliveries,
        SUM(CASE WHEN delivered_at <= estimated_delivery_date THEN 1 ELSE 0 END) as on_time_deliveries,
        ROUND(
          (SUM(CASE WHEN delivered_at <= estimated_delivery_date THEN 1 ELSE 0 END)::float / 
           NULLIF(COUNT(*), 0)) * 100, 
          2
        ) as service_rate
      FROM deliveries
      WHERE delivered_at IS NOT NULL
        AND created_at BETWEEN $1 AND $2
    `, [
      startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate || new Date()
    ]);

    res.json({
      success: true,
      data: {
        revenue: revenueStats.rows[0],
        service: serviceStats.rows[0]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (c.name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.phone ILIKE $${params.length})`;
    }

    const result = await query(`
      SELECT 
        c.*,
        COUNT(DISTINCT so.id) as total_orders,
        SUM(so.total_amount) as total_spent,
        MAX(so.created_at) as last_order_date
      FROM customers c
      LEFT JOIN sales_orders so ON c.id = so.customer_id
      WHERE ${whereClause}
      GROUP BY c.id
      ORDER BY c.name
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





