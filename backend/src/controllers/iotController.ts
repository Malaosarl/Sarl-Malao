import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { IoTService } from '../services/iotService';
import { query } from '../config/database';


export const recordSensorData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { device_id, housing_id, sensor_type, value, unit, metadata } = req.body;

    if (!device_id || !housing_id || !sensor_type || value === undefined) {
      res.status(400).json({
        success: false,
        error: 'Données incomplètes',
      });
      return;
    }

    const sensorDataId = await IoTService.recordSensorData({
      device_id,
      housing_id,
      sensor_type,
      value: parseFloat(value),
      unit: unit || '',
      metadata,
    });

    res.status(201).json({
      success: true,
      data: { id: sensorDataId },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getSensorData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { housingId, sensorType, startDate, endDate } = req.query;

    const data = await IoTService.getSensorData(
      housingId as string,
      sensorType as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getAlerts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { housingId, status, severity } = req.query;

    const alerts = await IoTService.getAlerts(
      housingId as string,
      status as string,
      severity as string
    );

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getHousings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { entityId } = req.query;

    let queryStr = `SELECT * FROM animal_housing WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (entityId) {
      queryStr += ` AND entity_id = $${paramIndex}`;
      params.push(entityId);
    }

    queryStr += ` ORDER BY name`;

    const result = await query(queryStr, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getDevices = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { housingId } = req.query;

    let queryStr = `SELECT * FROM iot_devices WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (housingId) {
      queryStr += ` AND housing_id = $${paramIndex}`;
      params.push(housingId);
    }

    queryStr += ` ORDER BY device_type, name`;

    const result = await query(queryStr, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};










