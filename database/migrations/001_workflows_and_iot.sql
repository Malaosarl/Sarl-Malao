-- Migration: Workflows de validation et Module IoT
-- Date: Octobre 2025

-- ============================================
-- WORKFLOWS DE VALIDATION
-- ============================================

CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- 'production_order', 'quote', 'quality_control', etc.
    steps JSONB NOT NULL, -- [{id, name, order, approver_role, is_required, can_reject}]
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    workflow_id UUID REFERENCES workflows(id),
    current_step UUID,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    submitted_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    validation_id UUID REFERENCES workflow_validations(id),
    step_id UUID NOT NULL,
    approved_by UUID REFERENCES users(id),
    comments TEXT,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_validations_entity ON workflow_validations(entity_type, entity_id);
CREATE INDEX idx_workflow_validations_status ON workflow_validations(status);

-- ============================================
-- MODULE IOT - HABITAT ANIMALIER
-- ============================================

CREATE TABLE IF NOT EXISTS animal_housing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    entity_id UUID REFERENCES entities(id),
    housing_type VARCHAR(50) NOT NULL, -- 'bétail', 'volaille', 'poisson'
    capacity INTEGER,
    location JSONB, -- {latitude, longitude, address}
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'maintenance', 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iot_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    housing_id UUID REFERENCES animal_housing(id),
    device_type VARCHAR(50) NOT NULL, -- 'sensor', 'actuator', 'gateway'
    device_model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    mac_address VARCHAR(50),
    ip_address VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'offline', 'maintenance', 'error'
    last_seen TIMESTAMP,
    firmware_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iot_sensor_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES iot_devices(id),
    housing_id UUID REFERENCES animal_housing(id),
    sensor_type VARCHAR(50) NOT NULL, -- 'temperature', 'humidity', 'air_quality', 'water_quality', 'feed_level', etc.
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20), -- '°C', '%', 'ppm', 'kg', etc.
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- {location, calibration_data, etc.}
);

CREATE TABLE IF NOT EXISTS iot_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES iot_devices(id),
    housing_id UUID REFERENCES animal_housing(id),
    alert_type VARCHAR(50) NOT NULL, -- 'threshold_exceeded', 'device_offline', 'anomaly', etc.
    severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    message TEXT NOT NULL,
    sensor_data_id UUID REFERENCES iot_sensor_data(id),
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'closed'
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iot_automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    housing_id UUID REFERENCES animal_housing(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition JSONB NOT NULL, -- {sensor_type, operator, threshold_value}
    action JSONB NOT NULL, -- {device_id, action_type, action_value}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_iot_sensor_data_device ON iot_sensor_data(device_id, timestamp);
CREATE INDEX idx_iot_sensor_data_housing ON iot_sensor_data(housing_id, timestamp);
CREATE INDEX idx_iot_sensor_data_type ON iot_sensor_data(sensor_type, timestamp);
CREATE INDEX idx_iot_alerts_status ON iot_alerts(status, severity);
CREATE INDEX idx_iot_alerts_housing ON iot_alerts(housing_id, created_at);
CREATE INDEX idx_iot_devices_housing ON iot_devices(housing_id, status);










