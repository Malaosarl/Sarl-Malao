import { query } from '../config/database';
import { NotificationService } from './notificationService';

export interface SensorData {
  device_id: string;
  housing_id: string;
  sensor_type: string;
  value: number;
  unit: string;
  timestamp?: Date;
  metadata?: any;
}

export interface IoTAlert {
  device_id: string;
  housing_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  sensor_data_id?: string;
}


export class IoTService {
  
  static async recordSensorData(data: SensorData): Promise<string> {
    const result = await query(
      `INSERT INTO iot_sensor_data 
       (device_id, housing_id, sensor_type, value, unit, metadata)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING id`,
      [
        data.device_id,
        data.housing_id,
        data.sensor_type,
        data.value,
        data.unit,
        JSON.stringify(data.metadata || {}),
      ]
    );

    const sensorDataId = result.rows[0].id;

    
    await this.checkThresholds(data, sensorDataId);

    
    await this.checkAutomationRules(data);

    return sensorDataId;
  }

  
  static async checkThresholds(data: SensorData, sensorDataId: string): Promise<void> {
    
    const thresholdsResult = await query(
      `SELECT * FROM iot_thresholds 
       WHERE housing_id = $1 AND sensor_type = $2 AND is_active = TRUE`,
      [data.housing_id, data.sensor_type]
    );

    for (const threshold of thresholdsResult.rows) {
      let shouldAlert = false;
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

      switch (threshold.operator) {
        case '>':
          shouldAlert = data.value > threshold.max_value;
          break;
        case '<':
          shouldAlert = data.value < threshold.min_value;
          break;
        case 'between':
          shouldAlert =
            data.value < threshold.min_value || data.value > threshold.max_value;
          break;
      }

      if (shouldAlert) {
        
        const deviation = Math.abs(
          data.value - (threshold.max_value || threshold.min_value)
        );
        const range = threshold.max_value - threshold.min_value || 1;

        if (deviation > range * 0.5) {
          severity = 'critical';
        } else if (deviation > range * 0.3) {
          severity = 'high';
        } else if (deviation > range * 0.1) {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        
        await this.createAlert({
          device_id: data.device_id,
          housing_id: data.housing_id,
          alert_type: 'threshold_exceeded',
          severity,
          message: `Seuil dépassé pour ${data.sensor_type}: ${data.value} ${data.unit} (seuil: ${threshold.min_value}-${threshold.max_value} ${data.unit})`,
          sensor_data_id: sensorDataId,
        });
      }
    }
  }

  
  static async createAlert(alert: IoTAlert): Promise<string> {
    const result = await query(
      `INSERT INTO iot_alerts 
       (device_id, housing_id, alert_type, severity, message, sensor_data_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'open')
       RETURNING id`,
      [
        alert.device_id,
        alert.housing_id,
        alert.alert_type,
        alert.severity,
        alert.message,
        alert.sensor_data_id,
      ]
    );

    const alertId = result.rows[0].id;

    
    await NotificationService.createInAppNotification({
      type: 'in_app',
      title: `Alerte IoT - ${alert.severity.toUpperCase()}`,
      message: alert.message,
      priority: alert.severity,
      action_url: `/app/iot/alerts/${alertId}`,
    });

    
    if (alert.severity === 'critical') {
      
      
    }

    return alertId;
  }

  
  static async checkAutomationRules(data: SensorData): Promise<void> {
    const rulesResult = await query(
      `SELECT * FROM iot_automation_rules 
       WHERE housing_id = $1 AND is_active = TRUE`,
      [data.housing_id]
    );

    for (const rule of rulesResult.rows) {
      const condition = rule.condition;
      const action = rule.action;

      
      if (
        condition.sensor_type === data.sensor_type &&
        this.evaluateCondition(data.value, condition.operator, condition.threshold_value)
      ) {
        
        await this.executeAutomationAction(action, data.housing_id);
      }
    }
  }

  
  private static evaluateCondition(
    value: number,
    operator: string,
    threshold: number
  ): boolean {
    switch (operator) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      default:
        return false;
    }
  }

  
  private static async executeAutomationAction(
    action: any,
    housingId: string
  ): Promise<void> {
    
    console.log('Exécution action automatisation:', action);
  }

  
  static async getSensorData(
    housingId: string,
    sensorType?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    let queryStr = `SELECT * FROM iot_sensor_data WHERE housing_id = $1`;
    const params: any[] = [housingId];
    let paramIndex = 2;

    if (sensorType) {
      queryStr += ` AND sensor_type = $${paramIndex}`;
      params.push(sensorType);
      paramIndex++;
    }

    if (startDate) {
      queryStr += ` AND timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryStr += ` AND timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryStr += ` ORDER BY timestamp DESC LIMIT 1000`;

    const result = await query(queryStr, params);
    return result.rows;
  }

  
  static async getAlerts(
    housingId?: string,
    status?: string,
    severity?: string
  ): Promise<any[]> {
    let queryStr = `SELECT * FROM iot_alerts WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (housingId) {
      queryStr += ` AND housing_id = $${paramIndex}`;
      params.push(housingId);
      paramIndex++;
    }

    if (status) {
      queryStr += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (severity) {
      queryStr += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    queryStr += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await query(queryStr, params);
    return result.rows;
  }
}

