-- Migration script to add pii_masked column to existing chunks table
-- Run this if you already have a chunks table without the pii_masked column

-- Add pii_masked column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chunks' AND column_name = 'pii_masked'
    ) THEN
        ALTER TABLE chunks ADD COLUMN pii_masked BOOLEAN DEFAULT FALSE;
        CREATE INDEX IF NOT EXISTS idx_chunks_pii_masked ON chunks(pii_masked);
        RAISE NOTICE 'Added pii_masked column to chunks table';
    ELSE
        RAISE NOTICE 'pii_masked column already exists in chunks table';
    END IF;
END $$;

-- Ensure vector indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_embeddings_cloud_hnsw 
  ON embeddings USING hnsw (embedding_cloud vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_embeddings_local_hnsw 
  ON embeddings USING hnsw (embedding_local vector_cosine_ops);

-- Verify the schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('documents', 'chunks', 'embeddings', 'audit_logs', 'users')
ORDER BY table_name, ordinal_position;