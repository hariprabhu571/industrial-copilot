-- Sample Error Code Data
-- Phase 32: Industrial Error Code Management

-- Insert sample error codes for different equipment types
INSERT INTO error_codes (code, equipment_id, severity_level, title, description, category, frequency_count, avg_resolution_time_minutes) VALUES
-- Conveyor System Errors (Equipment ID 3)
('CONV001', '770e8400-e29b-41d4-a716-446655440003', 'HIGH', 'Belt Misalignment', 'Conveyor belt has shifted from its proper tracking position', 'Mechanical', 15, 30),
('CONV002', '770e8400-e29b-41d4-a716-446655440003', 'CRITICAL', 'Motor Overload', 'Conveyor motor is drawing excessive current', 'Electrical', 8, 45),
('CONV003', '770e8400-e29b-41d4-a716-446655440003', 'MEDIUM', 'Speed Sensor Fault', 'Belt speed sensor is not responding correctly', 'Sensor', 12, 20),

-- PLC System Errors (Equipment ID 5)
('PLC001', '770e8400-e29b-41d4-a716-446655440005', 'CRITICAL', 'Communication Lost', 'PLC has lost communication with HMI system', 'Communication', 5, 60),
('PLC002', '770e8400-e29b-41d4-a716-446655440005', 'HIGH', 'I/O Module Fault', 'Input/Output module is not responding', 'Hardware', 7, 40),
('PLC003', '770e8400-e29b-41d4-a716-446655440005', 'MEDIUM', 'Memory Error', 'PLC memory allocation error detected', 'Software', 3, 25),

-- Pump System Errors (Equipment ID 1)
('PUMP001', '770e8400-e29b-41d4-a716-446655440001', 'HIGH', 'Cavitation Detected', 'Pump is experiencing cavitation due to low suction pressure', 'Mechanical', 10, 35),
('PUMP002', '770e8400-e29b-41d4-a716-446655440001', 'CRITICAL', 'Seal Failure', 'Mechanical seal has failed causing fluid leakage', 'Mechanical', 4, 120),
('PUMP003', '770e8400-e29b-41d4-a716-446655440001', 'MEDIUM', 'Vibration High', 'Pump vibration levels exceed normal operating range', 'Mechanical', 18, 45),

-- Additional Conveyor Errors (Equipment ID 4)
('CONV004', '770e8400-e29b-41d4-a716-446655440004', 'HIGH', 'Drive Chain Slack', 'Drive chain has excessive slack causing irregular motion', 'Mechanical', 22, 25),
('CONV005', '770e8400-e29b-41d4-a716-446655440004', 'MEDIUM', 'Bearing Temperature High', 'Roller bearing temperature above normal operating range', 'Thermal', 14, 30),
('CONV006', '770e8400-e29b-41d4-a716-446655440004', 'LOW', 'Belt Wear Detected', 'Conveyor belt showing signs of normal wear', 'Maintenance', 25, 15),

-- Additional Pump Errors (Equipment ID 2)
('PUMP004', '770e8400-e29b-41d4-a716-446655440002', 'HIGH', 'Impeller Damage', 'Pump impeller shows signs of erosion or damage', 'Mechanical', 6, 90),
('PUMP005', '770e8400-e29b-41d4-a716-446655440002', 'MEDIUM', 'Flow Rate Low', 'Pump flow rate below specified minimum', 'Performance', 9, 40),
('PUMP006', '770e8400-e29b-41d4-a716-446655440002', 'LOW', 'Filter Clogged', 'Suction filter requires cleaning due to contamination', 'Maintenance', 11, 20),

-- General Equipment Errors
('GEN001', NULL, 'CRITICAL', 'Emergency Stop Activated', 'Emergency stop button has been pressed', 'Safety', 3, 5),
('GEN002', NULL, 'HIGH', 'Power Supply Fault', 'Main power supply voltage outside acceptable range', 'Electrical', 7, 60),
('GEN003', NULL, 'MEDIUM', 'Temperature Sensor Fault', 'Ambient temperature sensor not responding', 'Sensor', 12, 25);

-- Insert troubleshooting procedures
INSERT INTO troubleshooting_procedures (error_code_id, step_number, title, instruction, estimated_time_minutes, required_tools, safety_notes, success_rate) VALUES
-- CONV001 - Belt Misalignment procedures
(1, 1, 'Safety Lockout', 'Lock out and tag out the conveyor system power supply', 5, ARRAY['Lockout kit', 'Tags'], 'Ensure all energy sources are isolated before proceeding', 100.00),
(1, 2, 'Visual Inspection', 'Inspect belt alignment and check for foreign objects', 10, ARRAY['Flashlight'], 'Check for pinch points and sharp edges', 95.00),
(1, 3, 'Adjust Tracking', 'Adjust belt tracking using adjustment bolts on tail pulley', 15, ARRAY['Wrench set', 'Allen keys'], 'Make small adjustments and test frequently', 85.00),

-- CONV002 - Motor Overload procedures
(2, 1, 'Emergency Stop', 'Press emergency stop button and isolate power', 2, ARRAY['None'], 'Do not attempt to restart until cause is identified', 100.00),
(2, 2, 'Check Current Draw', 'Measure motor current using clamp meter', 5, ARRAY['Clamp meter'], 'Ensure proper PPE when working near electrical components', 90.00),
(2, 3, 'Inspect Load', 'Check for mechanical binding or excessive load on conveyor', 15, ARRAY['Flashlight'], 'Look for jammed products or debris', 80.00),
(2, 4, 'Motor Inspection', 'Check motor connections and cooling fan operation', 10, ARRAY['Multimeter'], 'Allow motor to cool before inspection', 75.00),

-- PLC001 - Communication Lost procedures
(4, 1, 'Check Connections', 'Verify all communication cables are securely connected', 5, ARRAY['None'], 'Handle cables carefully to avoid damage', 70.00),
(4, 2, 'Network Diagnostics', 'Run network diagnostic tools to check communication path', 15, ARRAY['Laptop', 'Network cable'], 'Document any error messages for further analysis', 85.00),
(4, 3, 'Restart Sequence', 'Perform controlled restart of PLC and HMI systems', 10, ARRAY['None'], 'Follow proper shutdown sequence to avoid data loss', 90.00),

-- PUMP001 - Cavitation procedures
(7, 1, 'Check Suction Pressure', 'Measure suction pressure at pump inlet', 5, ARRAY['Pressure gauge'], 'Ensure gauge is properly calibrated', 95.00),
(7, 2, 'Inspect Suction Line', 'Check suction line for blockages or air leaks', 15, ARRAY['Flashlight', 'Leak detection spray'], 'Look for signs of air entrainment', 85.00),
(7, 3, 'Adjust Flow Rate', 'Reduce pump flow rate to eliminate cavitation', 10, ARRAY['Flow control valve'], 'Monitor pump performance during adjustment', 80.00),

-- PUMP002 - Seal Failure procedures
(8, 1, 'Emergency Shutdown', 'Immediately shut down pump and isolate from system', 2, ARRAY['None'], 'Critical safety issue - prevent environmental contamination', 100.00),
(8, 2, 'Drain System', 'Safely drain pump and connected piping', 30, ARRAY['Drain valves', 'Collection containers'], 'Follow environmental safety procedures', 95.00),
(8, 3, 'Replace Seal', 'Remove and replace mechanical seal assembly', 60, ARRAY['Seal kit', 'Torque wrench', 'Assembly tools'], 'Follow manufacturer specifications exactly', 85.00),
(8, 4, 'System Test', 'Refill system and perform leak test', 20, ARRAY['Pressure test equipment'], 'Gradually increase pressure to operating level', 90.00),

-- GEN001 - Emergency Stop procedures
(16, 1, 'Identify Cause', 'Determine why emergency stop was activated', 5, ARRAY['None'], 'Do not reset until cause is identified and resolved', 100.00),
(16, 2, 'Safety Check', 'Perform complete safety inspection of area', 10, ARRAY['Checklist'], 'Ensure all personnel are accounted for and safe', 100.00),
(16, 3, 'Reset Procedure', 'Follow proper emergency stop reset procedure', 5, ARRAY['Reset key'], 'Only authorized personnel should perform reset', 95.00);