-- Phase 29: Equipment Management System Schema Extension
-- Industrial AI Copilot - Equipment Management Tables

-- ============================================================================
-- EQUIPMENT MANAGEMENT CORE TABLES
-- ============================================================================

-- Equipment Categories (Types of industrial equipment)
CREATE TABLE IF NOT EXISTS equipment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES equipment_categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Locations (Plant hierarchy: Plant -> Area -> Line -> Station)
CREATE TABLE IF NOT EXISTS equipment_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  line VARCHAR(100),
  station VARCHAR(100),
  functional_location VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  coordinates_lat DECIMAL(10, 8),
  coordinates_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Master Data (Core equipment information)
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_number VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES equipment_categories(id),
  location_id UUID REFERENCES equipment_locations(id),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  installation_date DATE,
  commissioning_date DATE,
  warranty_expiry DATE,
  criticality VARCHAR(20) DEFAULT 'MEDIUM' CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  operational_state VARCHAR(20) DEFAULT 'OPERATIONAL' CHECK (operational_state IN ('OPERATIONAL', 'MAINTENANCE', 'OFFLINE', 'ALARM', 'DECOMMISSIONED')),
  status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Specifications (Technical specifications and parameters)
CREATE TABLE IF NOT EXISTS equipment_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  spec_type VARCHAR(50) NOT NULL, -- 'TECHNICAL', 'OPERATING', 'SAFETY', 'PERFORMANCE'
  spec_name VARCHAR(100) NOT NULL,
  spec_value TEXT NOT NULL,
  unit VARCHAR(20),
  min_value DECIMAL(15, 4),
  max_value DECIMAL(15, 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(equipment_id, spec_type, spec_name)
);

-- Maintenance Records (Work orders and maintenance history)
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  work_order_number VARCHAR(50) NOT NULL UNIQUE,
  work_type VARCHAR(20) NOT NULL CHECK (work_type IN ('PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'EMERGENCY', 'INSPECTION')),
  priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD')),
  description TEXT NOT NULL,
  scheduled_date TIMESTAMP,
  started_date TIMESTAMP,
  completed_date TIMESTAMP,
  estimated_duration INTEGER, -- minutes
  actual_duration INTEGER, -- minutes
  technician_assigned VARCHAR(100),
  technician_completed VARCHAR(100),
  labor_hours DECIMAL(8, 2),
  material_cost DECIMAL(12, 2),
  labor_cost DECIMAL(12, 2),
  total_cost DECIMAL(12, 2),
  notes TEXT,
  failure_code VARCHAR(50),
  root_cause TEXT,
  corrective_action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Status (Current operational status and real-time data)
CREATE TABLE IF NOT EXISTS equipment_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  status_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  operational_state VARCHAR(20) NOT NULL,
  availability_percentage DECIMAL(5, 2),
  reliability_percentage DECIMAL(5, 2),
  efficiency_percentage DECIMAL(5, 2),
  performance_data JSONB, -- Real-time sensor data
  alarm_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  runtime_hours DECIMAL(12, 2),
  cycle_count BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Alarms (Active alarms and notifications)
CREATE TABLE IF NOT EXISTS equipment_alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  alarm_code VARCHAR(50) NOT NULL,
  alarm_type VARCHAR(20) NOT NULL CHECK (alarm_type IN ('CRITICAL', 'WARNING', 'INFO')),
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
  description TEXT NOT NULL,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  acknowledged_by VARCHAR(100),
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(100),
  resolution_notes TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Documents (Links equipment to documents in RAG system)
CREATE TABLE IF NOT EXISTS equipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'MANUAL', 'SOP', 'DRAWING', 'SPECIFICATION', 'PROCEDURE'
  relevance_score DECIMAL(3, 2) DEFAULT 1.0,
  associated_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(equipment_id, document_id)
);

-- ============================================================================
-- USER PERMISSION EXTENSIONS FOR EQUIPMENT ACCESS
-- ============================================================================

-- Extend users table with equipment-specific permissions
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipment_role VARCHAR(50) DEFAULT 'viewer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS accessible_plants TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS accessible_areas TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS accessible_lines TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_equipment TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- User Equipment Permissions (Granular equipment access control)
CREATE TABLE IF NOT EXISTS user_equipment_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  location_id UUID REFERENCES equipment_locations(id) ON DELETE CASCADE,
  permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('FULL', 'READ_ONLY', 'OPERATIONAL', 'MAINTENANCE')),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(user_id, equipment_id),
  CHECK ((equipment_id IS NOT NULL) OR (location_id IS NOT NULL))
);

-- ============================================================================
-- ENTERPRISE SYSTEM SIMULATION TABLES (Multi-System Federation Demo)
-- ============================================================================

-- SAP Equipment Master Simulation
CREATE TABLE IF NOT EXISTS sap_equipment_master (
  equipment_number VARCHAR(50) PRIMARY KEY,
  plant VARCHAR(10) NOT NULL,
  equipment_category VARCHAR(20),
  description TEXT,
  manufacturer VARCHAR(100),
  model_number VARCHAR(100),
  serial_number VARCHAR(100),
  acquisition_date DATE,
  capitalized_value DECIMAL(15, 2),
  cost_center VARCHAR(20),
  functional_location VARCHAR(50),
  superior_equipment VARCHAR(50),
  position VARCHAR(10),
  technical_id_number VARCHAR(50),
  created_in_sap TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maximo Work Order Simulation
CREATE TABLE IF NOT EXISTS maximo_work_orders (
  wonum VARCHAR(20) PRIMARY KEY,
  equipment VARCHAR(50) NOT NULL,
  location VARCHAR(50),
  description TEXT,
  worktype VARCHAR(20),
  priority INTEGER,
  status VARCHAR(20),
  schedstart TIMESTAMP,
  schedfinish TIMESTAMP,
  actstart TIMESTAMP,
  actfinish TIMESTAMP,
  supervisor VARCHAR(100),
  lead VARCHAR(100),
  crew VARCHAR(50),
  estlabhrs DECIMAL(8, 2),
  actlabhrs DECIMAL(8, 2),
  estmatcost DECIMAL(12, 2),
  actmatcost DECIMAL(12, 2),
  created_in_maximo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MES Production Data Simulation
CREATE TABLE IF NOT EXISTS mes_production_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id VARCHAR(50) NOT NULL,
  production_order VARCHAR(50),
  shift VARCHAR(20),
  shift_date DATE,
  planned_quantity INTEGER,
  actual_quantity INTEGER,
  good_quantity INTEGER,
  reject_quantity INTEGER,
  downtime_minutes INTEGER,
  efficiency_percentage DECIMAL(5, 2),
  quality_percentage DECIMAL(5, 2),
  availability_percentage DECIMAL(5, 2),
  oee_percentage DECIMAL(5, 2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SCADA Status Data Simulation
CREATE TABLE IF NOT EXISTS scada_status_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name VARCHAR(100) NOT NULL,
  equipment_id VARCHAR(50) NOT NULL,
  tag_description TEXT,
  current_value DECIMAL(15, 4),
  unit VARCHAR(20),
  quality VARCHAR(20) DEFAULT 'GOOD',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  alarm_state VARCHAR(20) DEFAULT 'NORMAL',
  high_limit DECIMAL(15, 4),
  low_limit DECIMAL(15, 4)
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Equipment Management Indexes
CREATE INDEX IF NOT EXISTS idx_equipment_number ON equipment(equipment_number);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location_id);
CREATE INDEX IF NOT EXISTS idx_equipment_state ON equipment(operational_state);
CREATE INDEX IF NOT EXISTS idx_equipment_criticality ON equipment(criticality);

CREATE INDEX IF NOT EXISTS idx_equipment_locations_plant ON equipment_locations(plant);
CREATE INDEX IF NOT EXISTS idx_equipment_locations_area ON equipment_locations(area);
CREATE INDEX IF NOT EXISTS idx_equipment_locations_functional ON equipment_locations(functional_location);

CREATE INDEX IF NOT EXISTS idx_maintenance_equipment ON maintenance_records(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_type ON maintenance_records(work_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled ON maintenance_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_completed ON maintenance_records(completed_date);

CREATE INDEX IF NOT EXISTS idx_equipment_status_equipment ON equipment_status(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status_timestamp ON equipment_status(status_timestamp);

CREATE INDEX IF NOT EXISTS idx_equipment_alarms_equipment ON equipment_alarms(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_alarms_status ON equipment_alarms(status);
CREATE INDEX IF NOT EXISTS idx_equipment_alarms_triggered ON equipment_alarms(triggered_at);

CREATE INDEX IF NOT EXISTS idx_equipment_documents_equipment ON equipment_documents(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_documents_document ON equipment_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_equipment_documents_type ON equipment_documents(document_type);

-- User Permission Indexes
CREATE INDEX IF NOT EXISTS idx_users_equipment_role ON users(equipment_role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_user_equipment_permissions_user ON user_equipment_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_equipment_permissions_equipment ON user_equipment_permissions(equipment_id);

-- Enterprise System Simulation Indexes
CREATE INDEX IF NOT EXISTS idx_sap_plant ON sap_equipment_master(plant);
CREATE INDEX IF NOT EXISTS idx_sap_functional_location ON sap_equipment_master(functional_location);

CREATE INDEX IF NOT EXISTS idx_maximo_equipment ON maximo_work_orders(equipment);
CREATE INDEX IF NOT EXISTS idx_maximo_status ON maximo_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_maximo_schedstart ON maximo_work_orders(schedstart);

CREATE INDEX IF NOT EXISTS idx_mes_equipment ON mes_production_data(equipment_id);
CREATE INDEX IF NOT EXISTS idx_mes_shift_date ON mes_production_data(shift_date);

CREATE INDEX IF NOT EXISTS idx_scada_equipment_timestamp ON scada_status_data(equipment_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_scada_tag_timestamp ON scada_status_data(tag_name, timestamp);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Update equipment.updated_at on changes
CREATE TRIGGER update_equipment_updated_at 
  BEFORE UPDATE ON equipment 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update maintenance_records.updated_at on changes
CREATE TRIGGER update_maintenance_records_updated_at 
  BEFORE UPDATE ON maintenance_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update equipment operational_state when status changes
CREATE OR REPLACE FUNCTION update_equipment_operational_state()
RETURNS TRIGGER AS $func$
BEGIN
    UPDATE equipment 
    SET operational_state = NEW.operational_state,
        status_updated_at = NEW.status_timestamp
    WHERE id = NEW.equipment_id;
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

CREATE TRIGGER update_equipment_state_from_status
  AFTER INSERT OR UPDATE ON equipment_status
  FOR EACH ROW EXECUTE FUNCTION update_equipment_operational_state();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Equipment with Location Details
CREATE OR REPLACE VIEW equipment_with_location AS
SELECT 
  e.*,
  el.plant,
  el.area,
  el.line,
  el.station,
  el.functional_location,
  ec.name as category_name,
  ec.description as category_description
FROM equipment e
LEFT JOIN equipment_locations el ON e.location_id = el.id
LEFT JOIN equipment_categories ec ON e.category_id = ec.id;

-- Equipment Status Summary
CREATE OR REPLACE VIEW equipment_status_summary AS
SELECT 
  e.id,
  e.equipment_number,
  e.name,
  e.operational_state,
  es.availability_percentage,
  es.reliability_percentage,
  es.efficiency_percentage,
  es.alarm_count,
  es.warning_count,
  es.last_maintenance_date,
  es.next_maintenance_date,
  el.plant,
  el.area,
  el.line
FROM equipment e
LEFT JOIN equipment_status es ON e.id = es.equipment_id
LEFT JOIN equipment_locations el ON e.location_id = el.id;

-- Active Maintenance Summary
CREATE OR REPLACE VIEW active_maintenance_summary AS
SELECT 
  mr.*,
  e.equipment_number,
  e.name as equipment_name,
  el.plant,
  el.area,
  el.line
FROM maintenance_records mr
JOIN equipment e ON mr.equipment_id = e.id
LEFT JOIN equipment_locations el ON e.location_id = el.id
WHERE mr.status IN ('SCHEDULED', 'IN_PROGRESS');