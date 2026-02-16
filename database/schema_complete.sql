-- MALAO Production System - Schéma de Base de Données Complet
-- Version 2.0 - Octobre 2025
-- Compatible avec tous les contrôleurs développés

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS AND AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
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

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    category VARCHAR(100), -- 'bétail', 'volaille', 'poisson'
    subcategory VARCHAR(100), -- 'démarrage', 'croissance', 'finition'
    unit VARCHAR(20) DEFAULT 'kg',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    category VARCHAR(100), -- 'céréale', 'protéine', 'minéral'
    unit VARCHAR(20) DEFAULT 'kg',
    unit_price DECIMAL(10, 2),
    supplier_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_formula_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formula_id UUID REFERENCES production_formulas(id),
    raw_material_id UUID REFERENCES raw_materials(id),
    percentage DECIMAL(5, 2),
    quantity_kg DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    formula_id UUID REFERENCES production_formulas(id),
    quantity_planned DECIMAL(10, 2) NOT NULL,
    quantity_produced DECIMAL(10, 2),
    production_date DATE,
    scheduled_date DATE,
    team_id UUID,
    status VARCHAR(50) DEFAULT 'planned',
    raw_materials_used JSONB,
    raw_material_cost DECIMAL(10, 2),
    labor_cost DECIMAL(10, 2),
    energy_cost DECIMAL(10, 2),
    maintenance_cost DECIMAL(10, 2),
    other_costs DECIMAL(10, 2),
    production_rate DECIMAL(5, 2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_downtimes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES production_orders(id),
    reason VARCHAR(255),
    duration_minutes INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES production_orders(id),
    date DATE NOT NULL,
    yield_percentage DECIMAL(5, 2),
    efficiency_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_energy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES production_orders(id),
    date DATE NOT NULL,
    energy_consumption_kwh DECIMAL(10, 2),
    energy_consumption_kwh_per_ton DECIMAL(10, 2),
    total_energy_kwh DECIMAL(10, 2),
    co2_emissions_kg DECIMAL(10, 2),
    co2_emissions_kg_per_ton DECIMAL(10, 2),
    water_consumption_m3 DECIMAL(10, 2),
    water_consumption_m3_per_ton DECIMAL(10, 2),
    renewable_energy_percentage DECIMAL(5, 2),
    waste_valorization_percentage DECIMAL(5, 2),
    energy_price_per_kwh DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_labor_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES production_orders(id),
    labor_cost_per_hour DECIMAL(10, 2),
    hours_worked DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- QUALITY MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS quality_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES production_orders(id),
    lot_number VARCHAR(100),
    control_type VARCHAR(100) NOT NULL,
    parameters JSONB,
    results JSONB,
    is_compliant BOOLEAN,
    tested_by UUID REFERENCES users(id),
    tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quality_non_conformities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID REFERENCES quality_controls(id),
    order_id UUID REFERENCES production_orders(id),
    lot_number VARCHAR(100),
    description TEXT,
    severity VARCHAR(50),
    category VARCHAR(100),
    root_cause_analysis TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    status VARCHAR(50) DEFAULT 'open',
    reported_by UUID REFERENCES users(id),
    closed_by UUID REFERENCES users(id),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INVENTORY MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    type VARCHAR(50) NOT NULL, -- 'raw_material', 'finished_product'
    unit VARCHAR(20) DEFAULT 'kg',
    min_stock_level DECIMAL(10, 2),
    max_stock_level DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES inventory_items(id),
    type VARCHAR(50) NOT NULL, -- 'in', 'out'
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2),
    lot_number VARCHAR(100),
    expiry_date DATE,
    supplier_id UUID,
    invoice_number VARCHAR(100),
    order_id UUID,
    destination VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES inventory_items(id),
    theoretical_quantity DECIMAL(10, 2),
    counted_quantity DECIMAL(10, 2),
    difference DECIMAL(10, 2),
    notes TEXT,
    counted_by UUID REFERENCES users(id),
    counted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SALES MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    customer_type VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    items JSONB NOT NULL,
    total_amount DECIMAL(10, 2),
    validity_days INTEGER,
    notes TEXT,
    delivery_address TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES sales_quotes(id),
    customer_id UUID REFERENCES customers(id),
    items JSONB NOT NULL,
    total_amount DECIMAL(10, 2),
    delivery_address TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DELIVERY MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS delivery_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    make VARCHAR(100),
    model VARCHAR(100),
    capacity_tons DECIMAL(5, 2),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES sales_orders(id),
    vehicle_id UUID REFERENCES delivery_vehicles(id),
    driver_id UUID REFERENCES users(id),
    items JSONB,
    delivery_address TEXT,
    estimated_delivery_date DATE,
    estimated_distance_km DECIMAL(10, 2),
    actual_distance_km DECIMAL(10, 2),
    fuel_consumed_liters DECIMAL(10, 2),
    fuel_cost DECIMAL(10, 2),
    delivery_time_minutes INTEGER,
    cost_per_ton DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'scheduled',
    delivered_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MAINTENANCE MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS maintenance_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES maintenance_assets(id),
    intervention_type VARCHAR(50) NOT NULL, -- 'preventive', 'corrective'
    scheduled_date DATE,
    intervention_date DATE,
    description TEXT,
    parts_used JSONB,
    labor_hours DECIMAL(5, 2),
    actual_labor_hours DECIMAL(5, 2),
    labor_cost_per_hour DECIMAL(10, 2),
    parts_cost DECIMAL(10, 2),
    actual_parts_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    actual_total_cost DECIMAL(10, 2),
    technician_id UUID REFERENCES users(id),
    related_order_id UUID REFERENCES production_orders(id),
    status VARCHAR(50) DEFAULT 'scheduled',
    next_maintenance_date DATE,
    completed_at TIMESTAMP,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AGROPOLE MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS agropole_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    total_hectares DECIMAL(10, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agropole_parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES agropole_sites(id),
    parcel_number VARCHAR(50) NOT NULL,
    area_hectares DECIMAL(10, 2) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    current_crop_id UUID,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id, parcel_number)
);

CREATE TABLE IF NOT EXISTS agropole_crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES agropole_parcels(id),
    crop_type VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    sowing_date DATE,
    expected_harvest_date DATE,
    area_hectares DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'growing',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agropole_harvests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID REFERENCES agropole_crops(id),
    harvest_date DATE NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    quality_grade VARCHAR(50),
    storage_location VARCHAR(100),
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_orders_date ON production_orders(production_date);
CREATE INDEX IF NOT EXISTS idx_quality_controls_order ON quality_controls(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON inventory_stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_interventions_asset ON maintenance_interventions(asset_id);
CREATE INDEX IF NOT EXISTS idx_agropole_crops_parcel ON agropole_crops(parcel_id);
CREATE INDEX IF NOT EXISTS idx_agropole_harvests_crop ON agropole_harvests(crop_id);

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================

-- Mettre à jour les parcelles avec current_crop_id
ALTER TABLE agropole_parcels 
ADD CONSTRAINT fk_parcels_current_crop 
FOREIGN KEY (current_crop_id) REFERENCES agropole_crops(id);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);





