-- Migration: Seuils IoT
-- Date: Octobre 2025

CREATE TABLE IF NOT EXISTS iot_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    housing_id UUID REFERENCES animal_housing(id),
    sensor_type VARCHAR(50) NOT NULL,
    min_value DECIMAL(10, 2),
    max_value DECIMAL(10, 2),
    operator VARCHAR(10) DEFAULT 'between', -- '>', '<', 'between'
    severity VARCHAR(50) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_iot_thresholds_housing ON iot_thresholds(housing_id, sensor_type);










