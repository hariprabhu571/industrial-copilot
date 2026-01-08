import express from 'express';
import { query } from '../db/postgres.js';
import { authenticate } from '../auth/authMiddleware.js';

const router = express.Router();

// Get all documents
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        source,
        department,
        doc_type as type,
        version,
        status,
        uploaded_by,
        created_at,
        updated_at
      FROM documents 
      ORDER BY created_at DESC
    `);

    // Transform the data to match frontend interface
    const documents = result.rows.map(doc => ({
      id: doc.id,
      name: doc.name,
      department: doc.department,
      type: doc.type,
      size: 'Unknown', // We don't store file size in current schema
      uploadedAt: doc.created_at,
      uploadedBy: doc.uploaded_by,
      version: doc.version,
      status: doc.status,
      source: doc.source
    }));

    res.json({
      success: true,
      documents,
      total: documents.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    });
  }
});

// Get document by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        d.id,
        d.name,
        d.source,
        d.department,
        d.doc_type as type,
        d.version,
        d.status,
        d.uploaded_by,
        d.created_at,
        d.updated_at,
        COUNT(c.id) as chunk_count,
        COUNT(e.id) as embedding_count
      FROM documents d
      LEFT JOIN chunks c ON d.id = c.document_id
      LEFT JOIN embeddings e ON c.id = e.chunk_id
      WHERE d.id = $1
      GROUP BY d.id, d.name, d.source, d.department, d.doc_type, d.version, d.status, d.uploaded_by, d.created_at, d.updated_at
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const doc = result.rows[0];
    const document = {
      id: doc.id,
      name: doc.name,
      department: doc.department,
      type: doc.type,
      size: 'Unknown',
      uploadedAt: doc.created_at,
      uploadedBy: doc.uploaded_by,
      version: doc.version,
      status: doc.status,
      source: doc.source,
      chunkCount: parseInt(doc.chunk_count),
      embeddingCount: parseInt(doc.embedding_count)
    };

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document'
    });
  }
});

// Delete document
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    // Check if user has permission to delete documents
    if (!['admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete documents'
      });
    }

    // Delete embeddings first (foreign key constraint)
    await query(`
      DELETE FROM embeddings 
      WHERE chunk_id IN (
        SELECT id FROM chunks WHERE document_id = $1
      )
    `, [id]);

    // Delete chunks
    await query('DELETE FROM chunks WHERE document_id = $1', [id]);

    // Delete document
    const result = await query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
});

// Get document statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(DISTINCT d.id) as total_documents,
        COUNT(DISTINCT c.id) as total_chunks,
        COUNT(DISTINCT e.id) as total_embeddings,
        COUNT(DISTINCT d.department) as departments,
        COUNT(DISTINCT CASE WHEN e.embedding_cloud IS NOT NULL THEN e.id END) as cloud_embeddings,
        COUNT(DISTINCT CASE WHEN e.embedding_local IS NOT NULL THEN e.id END) as local_embeddings
      FROM documents d
      LEFT JOIN chunks c ON d.id = c.document_id
      LEFT JOIN embeddings e ON c.id = e.chunk_id
    `);

    const deptStats = await query(`
      SELECT 
        department,
        COUNT(*) as count,
        STRING_AGG(DISTINCT doc_type, ', ') as types
      FROM documents 
      GROUP BY department 
      ORDER BY count DESC
    `);

    const sectionStats = await query(`
      SELECT 
        section,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM chunks 
      GROUP BY section 
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      overview: stats.rows[0],
      departments: deptStats.rows,
      sections: sectionStats.rows
    });
  } catch (error) {
    console.error('Error fetching document statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default router;