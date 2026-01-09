import express from 'express';
import { query } from '../db/postgres.js';

const router = express.Router();

console.log('🔧 Error Code routes loaded');

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`🔍 Error Code route hit: ${req.method} ${req.path}`);
  next();
});

// GET /api/error-codes - Get all error codes
router.get('/', async (req, res) => {
  console.log('📋 GET /api/error-codes called');
  try {
    const result = await query('SELECT * FROM error_codes ORDER BY frequency_count DESC');
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('GET /api/error-codes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch error codes'
    });
  }
});

// GET /api/error-codes/code/:code - Get specific error code
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await query('SELECT * FROM error_codes WHERE code = $1', [code.toUpperCase()]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Error code not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('GET /api/error-codes/code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch error code'
    });
  }
});

// GET /api/error-codes/code/:code/procedures - Get troubleshooting procedures
router.get('/code/:code/procedures', async (req, res) => {
  try {
    const { code } = req.params;
    const procedureQuery = `
      SELECT tp.* FROM troubleshooting_procedures tp
      JOIN error_codes ec ON tp.error_code_id = ec.id
      WHERE ec.code = $1
      ORDER BY tp.step_number ASC
    `;
    const result = await query(procedureQuery, [code.toUpperCase()]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('GET /api/error-codes/code/procedures error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch troubleshooting procedures'
    });
  }
});

// GET /api/error-codes/search/:term - Search error codes
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const searchQuery = `
      SELECT * FROM error_codes
      WHERE code ILIKE $1 
         OR title ILIKE $1 
         OR description ILIKE $1
         OR category ILIKE $1
      ORDER BY 
        CASE WHEN code ILIKE $1 THEN 1 ELSE 2 END,
        frequency_count DESC
      LIMIT 20
    `;
    const searchPattern = `%${term}%`;
    const result = await query(searchQuery, [searchPattern]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      searchTerm: term
    });
  } catch (error) {
    console.error('GET /api/error-codes/search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search error codes'
    });
  }
});

// GET /api/error-codes/statistics - Get error code statistics
router.get('/statistics', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_error_codes,
        COUNT(CASE WHEN severity_level = 'CRITICAL' THEN 1 END) as critical_errors,
        COUNT(CASE WHEN severity_level = 'HIGH' THEN 1 END) as high_errors,
        COUNT(CASE WHEN severity_level = 'MEDIUM' THEN 1 END) as medium_errors,
        COUNT(CASE WHEN severity_level = 'LOW' THEN 1 END) as low_errors,
        AVG(frequency_count) as avg_frequency,
        AVG(avg_resolution_time_minutes) as avg_resolution_time
      FROM error_codes
    `;
    const result = await query(statsQuery);
    const stats = result.rows[0];
    
    res.json({
      success: true,
      data: {
        totalErrorCodes: parseInt(stats.total_error_codes) || 0,
        criticalErrors: parseInt(stats.critical_errors) || 0,
        highErrors: parseInt(stats.high_errors) || 0,
        mediumErrors: parseInt(stats.medium_errors) || 0,
        lowErrors: parseInt(stats.low_errors) || 0,
        avgFrequency: parseFloat(stats.avg_frequency) || 0,
        avgResolutionTime: parseFloat(stats.avg_resolution_time) || 0
      }
    });
  } catch (error) {
    console.error('GET /api/error-codes/statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch error code statistics'
    });
  }
});

export default router;