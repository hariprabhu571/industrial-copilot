-- Phase 29: Equipment Management Sample Data
-- Industrial AI Copilot - Realistic Industrial Equipment Data

-- ============================================================================
-- EQUIPMENT CATEGORIES (Industrial Equipment Types)
-- ============================================================================

INSERT INTO equipment_categories (id, name, description, parent_category_id) VALUES
-- Main Categories
('550e8400-e29b-41d4-a716-446655440001', 'ROTATING_EQUIPMENT', 'Pumps, Compressors, Motors, Fans', NULL),
('550e8400-e29b-41d4-a716-446655440002', 'STATIC_EQUIPMENT', 'Tanks, Vessels, Heat Exchangers', NULL),
('550e8400-e29b-41d4-a716-446655440003', 'CONTROL_SYSTEMS', 'PLCs, DCS, SCADA, Instrumentation', NULL),
('550e8400-e29b-41d4-a716-446655440004', 'MATERIAL_HANDLING', 'Conveyors, Cranes, Elevators', NULL),
('550e8400-e29b-41d4-a716-446655440005', 'UTILITIES', 'Electrical, HVAC, Compressed Air', NULL),

-- Sub-Categories for Rotating Equipment
('550e8400-e29b-41d4-a716-446655440011', 'PUMPS', 'Centrifugal, Positive Displacement', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440012', 'COMPRESSORS', 'Air, Gas, Refrigeration', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440013', 'MOTORS', 'AC, DC, Servo Motors', '550e8400-e29b-41d4-a716-446655440001'),

-- Sub-Categories for Control Systems
('550e8400-e29b-41d4-a716-446655440031', 'PLC_SYSTEMS', 'Programmable Logic Controllers', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440032', 'HMI_SYSTEMS', 'Human Machine Interfaces', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440033', 'SENSORS', 'Temperature, Pressure, Flow, Level', '550e8400-e29b-41d4-a716-446655440003');

-- ============================================================================
-- EQUIPMENT LOCATIONS (Plant Hierarchy)
-- ============================================================================

INSERT INTO equipment_locations (id, plant, area, line, station, functional_location, description) VALUES
-- Plant A - Manufacturing Facility
('660e8400-e29b-41d4-a716-446655440001', 'PLANT-A', 'PRODUCTION', 'LINE-1', 'STATION-1', 'PA-PROD-L1-S1', 'Assembly Line 1 - Station 1'),
('660e8400-e29b-41d4-a716-446655440002', 'PLANT-A', 'PRODUCTION', 'LINE-1', 'STATION-2', 'PA-PROD-L1-S2', 'Assembly Line 1 - Station 2'),
('660e8400-e29b-41d4-a716-446655440003', 'PLANT-A', 'PRODUCTION', 'LINE-2', 'STATION-1', 'PA-PROD-L2-S1', 'Packaging Line 2 - Station 1'),
('660e8400-e29b-41d4-a716-446655440004', 'PLANT-A', 'PRODUCTION', 'LINE-2', 'STATION-2', 'PA-PROD-L2-S2', 'Packaging Line 2 - Station 2'),
('660e8400-e29b-41d4-a716-446655440005', 'PLANT-A', 'UTILITIES', 'PUMP-HOUSE', NULL, 'PA-UTIL-PH', 'Pump House - Water Treatment'),
('660e8400-e29b-41d4-a716-446655440006', 'PLANT-A', 'UTILITIES', 'ELECTRICAL', NULL, 'PA-UTIL-ELEC', 'Main Electrical Distribution'),
('660e8400-e29b-41d4-a716-446655440007', 'PLANT-A', 'UTILITIES', 'COMPRESSED-AIR', NULL, 'PA-UTIL-AIR', 'Compressed Air System'),
('660e8400-e29b-41d4-a716-446655440008', 'PLANT-A', 'CONTROL-ROOM', 'MAIN-CONTROL', NULL, 'PA-CTRL-MAIN', 'Main Control Room'),

-- Plant B - Processing Facility
('660e8400-e29b-41d4-a716-446655440011', 'PLANT-B', 'PROCESS', 'REACTOR-1', NULL, 'PB-PROC-R1', 'Chemical Reactor 1'),
('660e8400-e29b-41d4-a716-446655440012', 'PLANT-B', 'PROCESS', 'REACTOR-2', NULL, 'PB-PROC-R2', 'Chemical Reactor 2'),
('660e8400-e29b-41d4-a716-446655440013', 'PLANT-B', 'PROCESS', 'DISTILLATION', NULL, 'PB-PROC-DIST', 'Distillation Column'),
('660e8400-e29b-41d4-a716-446655440014', 'PLANT-B', 'UTILITIES', 'COOLING-TOWER', NULL, 'PB-UTIL-CT', 'Cooling Tower System'),
('660e8400-e29b-41d4-a716-446655440015', 'PLANT-B', 'UTILITIES', 'BOILER', NULL, 'PB-UTIL-BOILER', 'Steam Boiler System');

-- ============================================================================
-- EQUIPMENT MASTER DATA (Industrial Equipment)
-- ============================================================================

INSERT INTO equipment (id, equipment_number, name, description, category_id, location_id, manufacturer, model, serial_number, installation_date, criticality, operational_state) VALUES

-- Plant A - Production Line Equipment
('770e8400-e29b-41d4-a716-446655440001', 'EQ-PMP-001', 'Centrifugal Pump #1', 'Main process water circulation pump', '550e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440005', 'Grundfos', 'CR64-2-2', 'GF2024001', '2023-01-15', 'HIGH', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440002', 'EQ-PMP-002', 'Centrifugal Pump #2', 'Backup process water circulation pump', '550e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440005', 'Grundfos', 'CR64-2-2', 'GF2024002', '2023-01-15', 'HIGH', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440003', 'EQ-CNV-001', 'Conveyor Belt System #1', 'Assembly line main conveyor', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Dorner', 'Model 2200', 'DN2024001', '2023-02-20', 'CRITICAL', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440004', 'EQ-CNV-002', 'Conveyor Belt System #2', 'Packaging line conveyor', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 'Dorner', 'Model 2200', 'DN2024002', '2023-02-20', 'CRITICAL', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440005', 'EQ-PLC-001', 'Allen Bradley PLC', 'Main production line controller', '550e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440008', 'Allen Bradley', 'ControlLogix 5580', 'AB2024001', '2023-03-10', 'CRITICAL', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440006', 'EQ-MOT-001', 'AC Motor #1', 'Conveyor drive motor', '550e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440001', 'Siemens', '1LE1001-1CB23-4AA4', 'SM2024001', '2023-02-25', 'MEDIUM', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440007', 'EQ-CMP-001', 'Air Compressor #1', 'Main plant compressed air supply', '550e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440007', 'Atlas Copco', 'GA30VSD', 'AC2024001', '2023-01-30', 'HIGH', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440008', 'EQ-HMI-001', 'Operator Interface Panel', 'Main production HMI', '550e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440008', 'Allen Bradley', 'PanelView Plus 7', 'AB2024002', '2023-03-15', 'MEDIUM', 'OPERATIONAL'),

-- Plant B - Process Equipment
('770e8400-e29b-41d4-a716-446655440011', 'EQ-RCT-001', 'Chemical Reactor #1', 'Main process reactor vessel', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440011', 'Pfaudler', 'RE-2000', 'PF2024001', '2022-11-15', 'CRITICAL', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440012', 'EQ-PMP-003', 'Chemical Transfer Pump', 'Reactor feed pump', '550e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440011', 'Flowserve', 'Mark 3', 'FS2024001', '2022-12-01', 'HIGH', 'MAINTENANCE'),
('770e8400-e29b-41d4-a716-446655440013', 'EQ-HEX-001', 'Heat Exchanger #1', 'Process cooling heat exchanger', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440013', 'Alfa Laval', 'M15-BFG', 'AL2024001', '2023-01-05', 'HIGH', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440014', 'EQ-COL-001', 'Distillation Column', 'Product separation column', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440013', 'Koch-Glitsch', 'FLEXIPAC 2Y', 'KG2024001', '2022-10-20', 'CRITICAL', 'OPERATIONAL'),
('770e8400-e29b-41d4-a716-446655440015', 'EQ-PLC-002', 'Process Control PLC', 'Reactor control system', '550e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440011', 'Siemens', 'S7-1500', 'SM2024002', '2022-11-20', 'CRITICAL', 'OPERATIONAL');

-- ============================================================================
-- EQUIPMENT SPECIFICATIONS (Technical Parameters)
-- ============================================================================

INSERT INTO equipment_specifications (equipment_id, spec_type, spec_name, spec_value, unit, min_value, max_value) VALUES

-- Pump Specifications
('770e8400-e29b-41d4-a716-446655440001', 'TECHNICAL', 'Flow Rate', '150', 'm³/h', 100, 200),
('770e8400-e29b-41d4-a716-446655440001', 'TECHNICAL', 'Head', '45', 'm', 35, 55),
('770e8400-e29b-41d4-a716-446655440001', 'TECHNICAL', 'Power', '15', 'kW', NULL, NULL),
('770e8400-e29b-41d4-a716-446655440001', 'OPERATING', 'Operating Temperature', '80', '°C', 10, 95),
('770e8400-e29b-41d4-a716-446655440001', 'OPERATING', 'Operating Pressure', '6', 'bar', 1, 10),
('770e8400-e29b-41d4-a716-446655440001', 'SAFETY', 'Maximum Pressure', '16', 'bar', NULL, NULL),
('770e8400-e29b-41d4-a716-446655440001', 'PERFORMANCE', 'Efficiency', '85', '%', 80, 90),

-- Conveyor Specifications
('770e8400-e29b-41d4-a716-446655440003', 'TECHNICAL', 'Belt Width', '600', 'mm', NULL, NULL),
('770e8400-e29b-41d4-a716-446655440003', 'TECHNICAL', 'Belt Length', '25', 'm', NULL, NULL),
('770e8400-e29b-41d4-a716-446655440003', 'OPERATING', 'Belt Speed', '0.5', 'm/s', 0.1, 2.0),
('770e8400-e29b-41d4-a716-446655440003', 'OPERATING', 'Load Capacity', '50', 'kg/m', 0, 75),
('770e8400-e29b-41d4-a716-446655440003', 'SAFETY', 'Emergency Stop', 'Available', NULL, NULL, NULL),

-- PLC Specifications
('770e8400-e29b-41d4-a716-446655440005', 'TECHNICAL', 'I/O Points', '512', 'points', NULL, NULL),
('770e8400-e29b-41d4-a716-446655440005', 'TECHNICAL', 'Memory', '4', 'MB', NULL, NULL),
('770e8400-e29b-41d4-a716-446655440005', 'TECHNICAL', 'Scan Time', '0.5', 'ms', NULL, NULL),
('770e8400-e29b-41d4-a716-446655440005', 'OPERATING', 'Operating Temperature', '25', '°C', 0, 60),

-- Reactor Specifications
('770e8400-e29b-41d4-a716-446655440011', 'TECHNICAL', 'Volume', '2000', 'L', NULL, NULL),
('770e8400-e29b-41d4-a716-446655440011', 'OPERATING', 'Operating Temperature', '150', '°C', 20, 200),
('770e8400-e29b-41d4-a716-446655440011', 'OPERATING', 'Operating Pressure', '5', 'bar', 0, 8),
('770e8400-e29b-41d4-a716-446655440011', 'SAFETY', 'Design Pressure', '10', 'bar', NULL, NULL),
('770e8400-e29b-41d4-a716-446655440011', 'SAFETY', 'Relief Valve Setting', '8.5', 'bar', NULL, NULL);

-- ============================================================================
-- MAINTENANCE RECORDS (Work Order History)
-- ============================================================================

INSERT INTO maintenance_records (id, equipment_id, work_order_number, work_type, priority, status, description, scheduled_date, completed_date, technician_assigned, technician_completed, labor_hours, material_cost, labor_cost, total_cost, notes) VALUES

-- Completed Maintenance
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'WO-2024-001', 'PREVENTIVE', 'MEDIUM', 'COMPLETED', 'Quarterly pump inspection and lubrication', '2024-01-15 08:00:00', '2024-01-15 12:00:00', 'john.smith', 'john.smith', 4.0, 150.00, 320.00, 470.00, 'Pump in good condition, replaced seals as preventive measure'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'WO-2024-002', 'CORRECTIVE', 'HIGH', 'COMPLETED', 'Conveyor belt replacement due to wear', '2024-01-20 06:00:00', '2024-01-20 18:00:00', 'mike.johnson', 'mike.johnson', 12.0, 2500.00, 960.00, 3460.00, 'Belt showed excessive wear, replaced with new belt and adjusted tension'),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 'WO-2024-003', 'PREVENTIVE', 'LOW', 'COMPLETED', 'PLC battery replacement', '2024-02-01 14:00:00', '2024-02-01 15:30:00', 'sarah.davis', 'sarah.davis', 1.5, 45.00, 120.00, 165.00, 'Battery voltage low, replaced with new lithium battery'),

-- Active/Scheduled Maintenance
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440012', 'WO-2024-004', 'CORRECTIVE', 'URGENT', 'IN_PROGRESS', 'Chemical pump seal leak repair', '2024-01-06 08:00:00', NULL, 'mike.johnson', NULL, NULL, 850.00, NULL, NULL, 'Pump showing signs of seal leakage, requires immediate attention'),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440007', 'WO-2024-005', 'PREVENTIVE', 'MEDIUM', 'SCHEDULED', 'Air compressor annual service', '2024-01-10 08:00:00', NULL, 'john.smith', NULL, NULL, 500.00, NULL, NULL, 'Annual preventive maintenance including oil change and filter replacement'),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440011', 'WO-2024-006', 'INSPECTION', 'HIGH', 'SCHEDULED', 'Reactor pressure vessel inspection', '2024-01-15 08:00:00', NULL, 'sarah.davis', NULL, NULL, 200.00, NULL, NULL, 'Annual pressure vessel inspection as per safety regulations');

-- ============================================================================
-- EQUIPMENT STATUS (Current Operational Status)
-- ============================================================================

INSERT INTO equipment_status (equipment_id, operational_state, availability_percentage, reliability_percentage, efficiency_percentage, alarm_count, warning_count, last_maintenance_date, next_maintenance_date, runtime_hours) VALUES

('770e8400-e29b-41d4-a716-446655440001', 'OPERATIONAL', 98.5, 99.2, 87.3, 0, 1, '2024-01-15', '2024-04-15', 2847.5),
('770e8400-e29b-41d4-a716-446655440002', 'OPERATIONAL', 99.1, 98.8, 88.1, 0, 0, '2023-10-15', '2024-01-15', 2156.2),
('770e8400-e29b-41d4-a716-446655440003', 'OPERATIONAL', 96.8, 97.5, 92.4, 0, 0, '2024-01-20', '2024-07-20', 3421.8),
('770e8400-e29b-41d4-a716-446655440004', 'OPERATIONAL', 98.2, 98.9, 91.7, 0, 0, '2023-12-10', '2024-06-10', 2987.3),
('770e8400-e29b-41d4-a716-446655440005', 'OPERATIONAL', 99.8, 99.9, 95.2, 0, 0, '2024-02-01', '2025-02-01', 8760.0),
('770e8400-e29b-41d4-a716-446655440006', 'OPERATIONAL', 97.3, 96.8, 89.5, 0, 1, '2023-11-20', '2024-05-20', 4123.7),
('770e8400-e29b-41d4-a716-446655440007', 'OPERATIONAL', 94.2, 95.1, 86.8, 1, 2, '2023-12-30', '2024-12-30', 6847.2),
('770e8400-e29b-41d4-a716-446655440008', 'OPERATIONAL', 99.5, 99.7, 98.1, 0, 0, '2024-01-05', '2025-01-05', 8640.0),
('770e8400-e29b-41d4-a716-446655440011', 'OPERATIONAL', 92.8, 94.3, 88.9, 0, 1, '2023-11-15', '2024-05-15', 5234.6),
('770e8400-e29b-41d4-a716-446655440012', 'MAINTENANCE', 0.0, 85.2, 0.0, 1, 0, '2023-09-20', '2024-01-06', 4567.8),
('770e8400-e29b-41d4-a716-446655440013', 'OPERATIONAL', 96.7, 97.8, 91.2, 0, 0, '2023-12-05', '2024-06-05', 3892.4),
('770e8400-e29b-41d4-a716-446655440014', 'OPERATIONAL', 98.9, 99.1, 94.6, 0, 0, '2023-10-20', '2024-04-20', 7234.1),
('770e8400-e29b-41d4-a716-446655440015', 'OPERATIONAL', 99.3, 99.6, 96.8, 0, 0, '2023-11-20', '2024-05-20', 8520.3);

-- ============================================================================
-- EQUIPMENT ALARMS (Active Alarms)
-- ============================================================================

INSERT INTO equipment_alarms (equipment_id, alarm_code, alarm_type, severity, description, status) VALUES

('770e8400-e29b-41d4-a716-446655440001', 'TEMP_HIGH', 'WARNING', 3, 'Pump bearing temperature slightly elevated', 'ACTIVE'),
('770e8400-e29b-41d4-a716-446655440006', 'VIB_HIGH', 'WARNING', 4, 'Motor vibration above normal range', 'ACTIVE'),
('770e8400-e29b-41d4-a716-446655440007', 'PRESS_LOW', 'CRITICAL', 7, 'Compressor discharge pressure below setpoint', 'ACTIVE'),
('770e8400-e29b-41d4-a716-446655440007', 'OIL_LEVEL', 'WARNING', 3, 'Oil level low - requires attention', 'ACTIVE'),
('770e8400-e29b-41d4-a716-446655440011', 'TEMP_TREND', 'WARNING', 2, 'Reactor temperature trending upward', 'ACTIVE'),
('770e8400-e29b-41d4-a716-446655440012', 'SEAL_LEAK', 'CRITICAL', 8, 'Pump mechanical seal leakage detected', 'ACTIVE');

-- ============================================================================
-- DEMO USERS WITH EQUIPMENT PERMISSIONS
-- ============================================================================

-- Update existing users with equipment roles and permissions
UPDATE users SET 
  equipment_role = 'admin',
  accessible_plants = ARRAY['PLANT-A', 'PLANT-B'],
  accessible_areas = ARRAY['PRODUCTION', 'UTILITIES', 'PROCESS', 'CONTROL-ROOM'],
  department = 'MANAGEMENT'
WHERE role = 'admin';

-- Insert demo users for equipment management
INSERT INTO users (id, username, email, password_hash, role, equipment_role, accessible_plants, accessible_areas, accessible_lines, assigned_equipment, department) VALUES

-- Plant Manager (Plant A access)
('990e8400-e29b-41d4-a716-446655440001', 'plant.manager', 'plant.manager@company.com', '$2b$10$rOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ', 'editor', 'plant_manager', ARRAY['PLANT-A'], ARRAY['PRODUCTION', 'UTILITIES', 'CONTROL-ROOM'], ARRAY['LINE-1', 'LINE-2'], NULL, 'OPERATIONS'),

-- Maintenance Supervisor (Plant A Production area)
('990e8400-e29b-41d4-a716-446655440002', 'maint.supervisor', 'maint.supervisor@company.com', '$2b$10$rOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ', 'editor', 'maintenance_supervisor', ARRAY['PLANT-A'], ARRAY['PRODUCTION', 'UTILITIES'], ARRAY['LINE-1', 'LINE-2'], NULL, 'MAINTENANCE'),

-- Senior Technician (Assigned specific equipment)
('990e8400-e29b-41d4-a716-446655440003', 'tech.senior', 'tech.senior@company.com', '$2b$10$rOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ', 'editor', 'technician', ARRAY['PLANT-A'], ARRAY['PRODUCTION', 'UTILITIES'], NULL, ARRAY['EQ-PMP-001', 'EQ-PMP-002', 'EQ-CNV-001', 'EQ-CMP-001'], 'MAINTENANCE'),

-- Line Operator (Line 1 only)
('990e8400-e29b-41d4-a716-446655440004', 'operator.line1', 'operator.line1@company.com', '$2b$10$rOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ', 'viewer', 'operator', ARRAY['PLANT-A'], ARRAY['PRODUCTION'], ARRAY['LINE-1'], NULL, 'OPERATIONS'),

-- Process Engineer (Plant B access)
('990e8400-e29b-41d4-a716-446655440005', 'process.engineer', 'process.engineer@company.com', '$2b$10$rOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ', 'editor', 'plant_manager', ARRAY['PLANT-B'], ARRAY['PROCESS', 'UTILITIES'], NULL, NULL, 'ENGINEERING'),

-- Maintenance Technician (Plant B specific equipment)
('990e8400-e29b-41d4-a716-446655440006', 'tech.plantb', 'tech.plantb@company.com', '$2b$10$rOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ9QZ9QZ9QOzJqQZ9QZ9QZ', 'editor', 'technician', ARRAY['PLANT-B'], ARRAY['PROCESS'], NULL, ARRAY['EQ-RCT-001', 'EQ-PMP-003', 'EQ-HEX-001'], 'MAINTENANCE');

-- ============================================================================
-- ENTERPRISE SYSTEM SIMULATION DATA
-- ============================================================================

-- SAP Equipment Master Simulation
INSERT INTO sap_equipment_master (equipment_number, plant, equipment_category, description, manufacturer, model_number, serial_number, acquisition_date, capitalized_value, cost_center, functional_location) VALUES

('EQ-PMP-001', 'PA01', 'PUMP', 'Centrifugal Pump #1', 'Grundfos', 'CR64-2-2', 'GF2024001', '2023-01-15', 25000.00, 'CC-UTIL-001', 'PA-UTIL-PH'),
('EQ-PMP-002', 'PA01', 'PUMP', 'Centrifugal Pump #2', 'Grundfos', 'CR64-2-2', 'GF2024002', '2023-01-15', 25000.00, 'CC-UTIL-001', 'PA-UTIL-PH'),
('EQ-CNV-001', 'PA01', 'CONV', 'Conveyor Belt System #1', 'Dorner', 'Model 2200', 'DN2024001', '2023-02-20', 45000.00, 'CC-PROD-001', 'PA-PROD-L1-S1'),
('EQ-CNV-002', 'PA01', 'CONV', 'Conveyor Belt System #2', 'Dorner', 'Model 2200', 'DN2024002', '2023-02-20', 45000.00, 'CC-PROD-002', 'PA-PROD-L2-S1'),
('EQ-PLC-001', 'PA01', 'CTRL', 'Allen Bradley PLC', 'Allen Bradley', 'ControlLogix 5580', 'AB2024001', '2023-03-10', 35000.00, 'CC-CTRL-001', 'PA-CTRL-MAIN'),
('EQ-RCT-001', 'PB01', 'REAC', 'Chemical Reactor #1', 'Pfaudler', 'RE-2000', 'PF2024001', '2022-11-15', 150000.00, 'CC-PROC-001', 'PB-PROC-R1'),
('EQ-PMP-003', 'PB01', 'PUMP', 'Chemical Transfer Pump', 'Flowserve', 'Mark 3', 'FS2024001', '2022-12-01', 35000.00, 'CC-PROC-001', 'PB-PROC-R1');

-- Maximo Work Order Simulation
INSERT INTO maximo_work_orders (wonum, equipment, location, description, worktype, priority, status, schedstart, schedfinish, supervisor, lead, estlabhrs, actlabhrs, estmatcost, actmatcost) VALUES

('WO-2024-001', 'EQ-PMP-001', 'PA-UTIL-PH', 'Quarterly pump inspection and lubrication', 'PM', 2, 'COMP', '2024-01-15 08:00:00', '2024-01-15 12:00:00', 'SUPERVISOR1', 'TECH001', 4.0, 4.0, 150.00, 150.00),
('WO-2024-002', 'EQ-CNV-001', 'PA-PROD-L1-S1', 'Conveyor belt replacement due to wear', 'CM', 1, 'COMP', '2024-01-20 06:00:00', '2024-01-20 18:00:00', 'SUPERVISOR1', 'TECH002', 10.0, 12.0, 2500.00, 2500.00),
('WO-2024-003', 'EQ-PLC-001', 'PA-CTRL-MAIN', 'PLC battery replacement', 'PM', 3, 'COMP', '2024-02-01 14:00:00', '2024-02-01 15:30:00', 'SUPERVISOR2', 'TECH003', 2.0, 1.5, 45.00, 45.00),
('WO-2024-004', 'EQ-PMP-003', 'PB-PROC-R1', 'Chemical pump seal leak repair', 'CM', 1, 'INPRG', '2024-01-06 08:00:00', NULL, 'SUPERVISOR3', 'TECH002', 8.0, NULL, 850.00, NULL),
('WO-2024-005', 'EQ-CMP-001', 'PA-UTIL-AIR', 'Air compressor annual service', 'PM', 2, 'WSCH', '2024-01-10 08:00:00', NULL, 'SUPERVISOR1', 'TECH001', 6.0, NULL, 500.00, NULL);

-- MES Production Data Simulation
INSERT INTO mes_production_data (equipment_id, production_order, shift, shift_date, planned_quantity, actual_quantity, good_quantity, reject_quantity, downtime_minutes, efficiency_percentage, quality_percentage, availability_percentage, oee_percentage) VALUES

('EQ-CNV-001', 'PO-2024-001', 'DAY', '2024-01-05', 1000, 980, 965, 15, 45, 98.0, 98.5, 93.8, 90.4),
('EQ-CNV-001', 'PO-2024-002', 'NIGHT', '2024-01-05', 800, 785, 775, 10, 30, 98.1, 98.7, 95.8, 92.7),
('EQ-CNV-002', 'PO-2024-003', 'DAY', '2024-01-05', 1200, 1180, 1165, 15, 60, 98.3, 98.7, 92.5, 89.8),
('EQ-RCT-001', 'BATCH-001', 'DAY', '2024-01-05', 5000, 4950, 4925, 25, 120, 99.0, 99.5, 90.0, 88.6),
('EQ-RCT-001', 'BATCH-002', 'NIGHT', '2024-01-05', 5000, 4980, 4960, 20, 90, 99.6, 99.6, 92.5, 91.7);

-- SCADA Status Data Simulation
INSERT INTO scada_status_data (tag_name, equipment_id, tag_description, current_value, unit, quality, alarm_state, high_limit, low_limit) VALUES

('PMP001_FLOW', 'EQ-PMP-001', 'Pump 1 Flow Rate', 145.5, 'm³/h', 'GOOD', 'NORMAL', 200.0, 100.0),
('PMP001_PRESS', 'EQ-PMP-001', 'Pump 1 Discharge Pressure', 6.2, 'bar', 'GOOD', 'NORMAL', 10.0, 4.0),
('PMP001_TEMP', 'EQ-PMP-001', 'Pump 1 Bearing Temperature', 68.5, '°C', 'GOOD', 'WARNING', 85.0, 20.0),
('CNV001_SPEED', 'EQ-CNV-001', 'Conveyor 1 Belt Speed', 0.48, 'm/s', 'GOOD', 'NORMAL', 2.0, 0.1),
('CNV001_LOAD', 'EQ-CNV-001', 'Conveyor 1 Load Current', 12.5, 'A', 'GOOD', 'NORMAL', 20.0, 5.0),
('CMP001_PRESS', 'EQ-CMP-001', 'Compressor Discharge Pressure', 5.8, 'bar', 'GOOD', 'ALARM', 8.0, 6.5),
('RCT001_TEMP', 'EQ-RCT-001', 'Reactor Temperature', 148.2, '°C', 'GOOD', 'NORMAL', 200.0, 50.0),
('RCT001_PRESS', 'EQ-RCT-001', 'Reactor Pressure', 4.8, 'bar', 'GOOD', 'NORMAL', 8.0, 1.0),
('PMP003_FLOW', 'EQ-PMP-003', 'Chemical Pump Flow', 0.0, 'm³/h', 'BAD', 'ALARM', 50.0, 10.0);