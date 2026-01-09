-- Industrial AI Copilot Database Schema
-- PostgreSQL with pgvector extension

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table - stores document metadata
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  source VARCHAR(100) NOT NULL,
  department VARCHAR(100) DEFAULT 'general',
  doc_type VARCHAR(100) DEFAULT 'general',
  version VARCHAR(50) DEFAULT 'v1.0',
  status VARCHAR(50) DEFAULT 'active',
  uploaded_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chunks table - stores text chunks with metadata
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  section VARCHAR(100) DEFAULT 'general',
  pii_masked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, chunk_index)
);

-- Embeddings table - stores vector embeddings (hybrid local/cloud)
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  embedding_cloud vector(768), -- Gemini embeddings
  embedding_local vector(384),  -- Local model embeddings (sentence-transformers)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chunk_id)
);

-- Audit logs table - tracks all queries and responses
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  retrieved_documents JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(100),
  session_id VARCHAR(100)
);

-- Users table - for authentication and role management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer', -- admin, editor, viewer
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_department ON documents(department);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_section ON chunks(section);
CREATE INDEX IF NOT EXISTS idx_chunks_pii_masked ON chunks(pii_masked);

CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_id ON embeddings(chunk_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Vector similarity search indexes (HNSW for better performance)
CREATE INDEX IF NOT EXISTS idx_embeddings_cloud_hnsw 
  ON embeddings USING hnsw (embedding_cloud vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_embeddings_local_hnsw 
  ON embeddings USING hnsw (embedding_local vector_cosine_ops);

-- Update trigger for documents
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Error codes table
CREATE TABLE IF NOT EXISTS error_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    equipment_id INTEGER REFERENCES equipment(id),
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
    equipment_id INTEGER REFERENCES equipment(id),
    user_id INTEGER,
    resolution_time_minutes INTEGER,
    successful BOOLEAN DEFAULT true,
    procedure_steps_followed INTEGER[],
    notes TEXT,
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Error code indexes for performance
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