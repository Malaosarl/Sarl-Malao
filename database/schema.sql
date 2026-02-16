-- MALAO Production System Database Schema
-- Version 2.0 - October 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS AND AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    entity_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'MACOSARL', 'MALAO_AGRO', 'MALAO_HEALTH', etc.
    parent_id UUID REFERENCES entities(id),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PRODUCTION MODULE
-- ============================================

CREATE TABLE production_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    entity_id UUID REFERENCES entities(id),
    capacity_per_hour DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'maintenance', 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL, -- 'bétail', 'volaille', 'poisson'
    product_category VARCHAR(100), -- 'démarrage', 'croissance', 'finition'
    version INTEGER DEFAULT 1,
    ingredients JSONB NOT NULL, -- {ingredient_id: percentage}
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    formula_id UUID REFERENCES product_formulas(id),
    production_line_id UUID REFERENCES production_lines(id),
    planned_quantity DECIMAL(10, 2) NOT NULL, -- in tons
    actual_quantity DECIMAL(10, 2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'cancelled'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES production_orders(id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity DECIMAL(10, 2) NOT NULL,
    consumption_data JSONB, -- {ingredient_id: quantity_used}
    waste_percentage DECIMAL(5, 2),
    energy_kwh DECIMAL(10, 2),
    water_m3 DECIMAL(10, 2),
    notes TEXT,
    recorded_by UUID REFERENCES users(id)
);

-- ============================================
-- QUALITY MODULE
-- ============================================

CREATE TABLE quality_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES production_orders(id),
    control_type VARCHAR(50) NOT NULL, -- 'physico-chimique', 'microbiologique', 'traçabilité'
    control_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters JSONB NOT NULL, -- {parameter_name: value}
    is_conform BOOLEAN,
    non_conformity_description TEXT,
    corrective_action TEXT,
    controlled_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quality_non_conformities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID REFERENCES quality_controls(id),
    severity VARCHAR(50), -- 'minor', 'major', 'critical'
    root_cause_analysis TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'closed'
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INVENTORY MODULE
-- ============================================

CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'céréale', 'protéine', 'minéral', 'additif'
    unit VARCHAR(20) DEFAULT 'kg',
    supplier_id UUID,
    min_stock_level DECIMAL(10, 2),
    max_stock_level DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    formula_id UUID REFERENCES product_formulas(id),
    unit VARCHAR(20) DEFAULT 'kg',
    min_stock_level DECIMAL(10, 2),
    max_stock_level DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_type VARCHAR(50) NOT NULL, -- 'ingredient', 'product'
    item_id UUID NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment', 'transfer'
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2),
    lot_number VARCHAR(100),
    expiry_date DATE,
    reference_type VARCHAR(50), -- 'order', 'production', 'delivery'
    reference_id UUID,
    warehouse_location VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_type VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    warehouse_location VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_type, item_id, warehouse_location)
);

-- ============================================
-- SALES MODULE
-- ============================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    customer_type VARCHAR(50), -- 'éleveur', 'agriculteur', 'distributeur'
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    region VARCHAR(100),
    city VARCHAR(100),
    payment_terms VARCHAR(50),
    credit_limit DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    quote_date DATE NOT NULL,
    expiry_date DATE,
    items JSONB NOT NULL, -- [{product_id, quantity, unit_price}]
    subtotal DECIMAL(10, 2),
    tax DECIMAL(10, 2),
    total DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected', 'expired'
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quote_id UUID REFERENCES quotes(id),
    customer_id UUID REFERENCES customers(id),
    order_date DATE NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2),
    tax DECIMAL(10, 2),
    total DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled'
    delivery_address TEXT,
    delivery_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    vehicle_id UUID,
    driver_id UUID REFERENCES users(id),
    planned_date DATE,
    actual_date DATE,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_transit', 'delivered', 'failed'
    delivery_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    delivery_notes TEXT,
    signature_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AGROPOLE MODULE
-- ============================================

CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    entity_id UUID REFERENCES entities(id),
    location_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    total_hectares DECIMAL(10, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id),
    parcel_number VARCHAR(50) NOT NULL,
    hectares DECIMAL(10, 2) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    soil_type VARCHAR(100),
    irrigation_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'cultivated', 'fallow'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id, parcel_number)
);

CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES parcels(id),
    crop_type VARCHAR(100) NOT NULL, -- 'maïs', 'soja', 'tournesol', etc.
    variety VARCHAR(100),
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    planting_area_hectares DECIMAL(10, 2),
    expected_yield DECIMAL(10, 2),
    actual_yield DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'planted', -- 'planted', 'growing', 'harvested', 'failed'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE harvests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID REFERENCES crops(id),
    harvest_date DATE NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    quality_grade VARCHAR(50),
    storage_location VARCHAR(100),
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MAINTENANCE MODULE
-- ============================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100), -- 'machine', 'vehicle', 'equipment'
    production_line_id UUID REFERENCES production_lines(id),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    installation_date DATE,
    status VARCHAR(50) DEFAULT 'operational', -- 'operational', 'maintenance', 'broken', 'retired'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(id),
    maintenance_type VARCHAR(50) NOT NULL, -- 'preventive', 'corrective'
    frequency_type VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'hours'
    frequency_value INTEGER,
    description TEXT,
    estimated_duration_hours DECIMAL(5, 2),
    parts_required JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES maintenance_plans(id),
    asset_id UUID REFERENCES assets(id),
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'preventive', 'corrective', 'emergency'
    scheduled_date DATE,
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    description TEXT,
    downtime_hours DECIMAL(5, 2),
    cost DECIMAL(10, 2),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DELIVERY & VEHICLES MODULE
-- ============================================

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50), -- 'truck', 'van', 'pickup'
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    capacity_tons DECIMAL(5, 2),
    fuel_type VARCHAR(50), -- 'diesel', 'petrol', 'electric'
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'in_use', 'maintenance', 'retired'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fuel_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES users(id),
    refuel_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    liters DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2),
    odometer_reading DECIMAL(10, 2),
    fuel_type VARCHAR(50),
    station_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_production_orders_status ON production_orders(status);
CREATE INDEX idx_production_orders_formula ON production_orders(formula_id);
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(item_type, item_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_crops_parcel ON crops(parcel_id);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_maintenance_work_orders_asset ON maintenance_work_orders(asset_id);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);








