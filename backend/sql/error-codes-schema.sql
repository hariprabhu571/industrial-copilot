-- Error Code & Troubleshooting System Schema
-- Phase 32: Industrial Error Code Management

-- Error codes table
CREATE TABLE IF NOT EXISTS error_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    equipment_id UUID REFERENCES equipment(id),
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    frequency_count INTEGER DEFAULT 0,
    avg_resolution_time_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Troubleshooting procedures table
CREATE TABLE IF NOT EXISTS troubleshooting_procedures (
    id SERIAL PRIMARY KEY,
    error_code_id INTEGER REFERENCES error_codes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    instruction TEXT NOT NULL,
    estimated_time_minutes INTEGER DEFAULT 5,
    required_tools TEXT[],
    safety_notes TEXT,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Error resolution history table
CREATE TABLE IF NOT EXISTS error_resolutions (
    id SERIAL PRIMARY KEY,
    error_code_id INTEGER REFERENCES error_codes(id),
    equipment_id UUID REFERENCES equipment(id),
    user_id INTEGER,
    resolution_time_minutes INTEGER,
    successful BOOLEAN DEFAULT true,
    procedure_steps_followed INTEGER[],
    notes TEXT,
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_codes_code ON error_codes(code);
CREATE INDEX IF NOT EXISTS idx_error_codes_equipment ON error_codes(equipment_id);
CREATE INDEX IF NOT EXISTS idx_error_codes_severity ON error_codes(severity_level);
CREATE INDEX IF NOT EXISTS idx_error_codes_category ON error_codes(category);
CREATE INDEX IF NOT EXISTS idx_troubleshooting_error_code ON troubleshooting_procedures(error_code_id);
CREATE INDEX IF NOT EXISTS idx_error_resolutions_code ON error_resolutions(error_code_id);
CREATE INDEX IF NOT EXISTS idx_error_resolutions_equipment ON error_resolutions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_error_resolutions_date ON error_resolutions(resolved_at);

-- Update trigger for error_codes updated_at
CREATE OR REPLACE FUNCTION update_error_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_error_codes_updated_at
    BEFORE UPDATE ON error_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_error_codes_updated_at();