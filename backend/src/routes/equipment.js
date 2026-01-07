// Equipment Management API Routes
// Phase 29: Industrial AI Copilot - Equipment REST API

import express from 'express';
import EquipmentService from '../services/EquipmentService.js';
import { query } from '../db/postgres.js';

const router = express.Router();

// Initialize equipment service
const equipmentService = new EquipmentService(query);

/**
 * GET /api/equipment
 * Search equipment with filters and pagination
 */
router.get('/', async (req, res) => {
  try {
    console.log(`🔍 Equipment search request from user: ${req.user.username}`);
    
    const searchParams = {
      equipmentNumber: req.query.equipmentNumber,
      name: req.query.name,
      manufacturer: req.query.manufacturer,
      model: req.query.model,
      category: req.query.category,
      plant: req.query.plant,
      area: req.query.area,
      line: req.query.line,
      operationalState: req.query.operationalState,
      criticality: req.query.criticality,
      hasAlarms: req.query.hasAlarms === 'true',
      maintenanceDue: req.query.maintenanceDue === 'true',
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };
    
    const result = await equipmentService.searchEquipment(searchParams, req.user);
    
    res.json({
      success: true,
      data: result.equipment,
      pagination: result.pagination,
      message: `Found ${result.equipment.length} equipment items`
    });
    
  } catch (error) {
    console.error('Equipment search error:', error.message);
    res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/statistics
 * Get equipment statistics dashboard
 */
router.get('/statistics', async (req, res) => {
  try {
    console.log(`📈 Equipment statistics request from user: ${req.user.username}`);
    
    const statistics = await equipmentService.getEquipmentStatistics(req.user);
    
    res.json({
      success: true,
      data: statistics,
      message: 'Equipment statistics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Equipment statistics error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/health
 * Get adapter health status (admin only)
 */
router.get('/health', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Admin privileges required'
      });
    }
    
    console.log(`🏥 Adapter health check request from admin: ${req.user.username}`);
    
    const health = await equipmentService.getAdapterHealth();
    
    res.json({
      success: true,
      data: health,
      message: 'Adapter health status retrieved successfully'
    });
    
  } catch (error) {
    console.error('Adapter health error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/categories
 * Get equipment categories
 */
router.get('/categories', async (req, res) => {
  try {
    console.log(`📋 Equipment categories request from user: ${req.user.username}`);
    
    const categoriesQuery = `
      SELECT 
        ec.*,
        parent.name as parent_name
      FROM equipment_categories ec
      LEFT JOIN equipment_categories parent ON ec.parent_category_id = parent.id
      ORDER BY ec.name
    `;
    
    const result = await query(categoriesQuery);
    
    res.json({
      success: true,
      data: result.rows,
      message: `Found ${result.rows.length} equipment categories`
    });
    
  } catch (error) {
    console.error('Equipment categories error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/locations
 * Get equipment locations
 */
router.get('/locations', async (req, res) => {
  try {
    console.log(`🗺️ Equipment locations request from user: ${req.user.username}`);
    
    const locationsQuery = `
      SELECT DISTINCT
        el.plant,
        el.area,
        el.line,
        COUNT(e.id) as equipment_count
      FROM equipment_locations el
      LEFT JOIN equipment e ON el.id = e.location_id
      GROUP BY el.plant, el.area, el.line
      ORDER BY el.plant, el.area, el.line
    `;
    
    const result = await query(locationsQuery);
    
    // Group by plant and area for hierarchical structure
    const locations = {};
    
    result.rows.forEach(row => {
      if (!locations[row.plant]) {
        locations[row.plant] = {};
      }
      
      if (!locations[row.plant][row.area]) {
        locations[row.plant][row.area] = [];
      }
      
      if (row.line) {
        locations[row.plant][row.area].push({
          line: row.line,
          equipmentCount: parseInt(row.equipment_count)
        });
      }
    });
    
    res.json({
      success: true,
      data: locations,
      message: 'Equipment locations retrieved successfully'
    });
    
  } catch (error) {
    console.error('Equipment locations error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/:id
 * Get equipment details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    console.log(`🔍 Equipment detail request for ${req.params.id} from user: ${req.user.username}`);
    
    const equipment = await equipmentService.getEquipmentById(req.params.id, req.user);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found'
      });
    }
    
    res.json({
      success: true,
      data: equipment,
      message: `Equipment ${equipment.equipmentNumber} retrieved successfully`
    });
    
  } catch (error) {
    console.error('Equipment detail error:', error.message);
    res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/:id/maintenance
 * Get maintenance history for equipment
 */
router.get('/:id/maintenance', async (req, res) => {
  try {
    console.log(`🔧 Maintenance history request for ${req.params.id} from user: ${req.user.username}`);
    
    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      status: req.query.status
    };
    
    const maintenanceRecords = await equipmentService.getMaintenanceHistory(req.params.id, req.user, options);
    
    res.json({
      success: true,
      data: maintenanceRecords,
      message: `Found ${maintenanceRecords.length} maintenance records`
    });
    
  } catch (error) {
    console.error('Maintenance history error:', error.message);
    res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/:id/status
 * Get current equipment status
 */
router.get('/:id/status', async (req, res) => {
  try {
    console.log(`📊 Equipment status request for ${req.params.id} from user: ${req.user.username}`);
    
    const status = await equipmentService.getEquipmentStatus(req.params.id, req.user);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Equipment status not found'
      });
    }
    
    res.json({
      success: true,
      data: status,
      message: 'Equipment status retrieved successfully'
    });
    
  } catch (error) {
    console.error('Equipment status error:', error.message);
    res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/:id/alarms
 * Get equipment alarms
 */
router.get('/:id/alarms', async (req, res) => {
  try {
    console.log(`🚨 Equipment alarms request for ${req.params.id} from user: ${req.user.username}`);
    
    const activeOnly = req.query.activeOnly !== 'false';
    const alarms = await equipmentService.getEquipmentAlarms(req.params.id, req.user, activeOnly);
    
    res.json({
      success: true,
      data: alarms,
      message: `Found ${alarms.length} alarms`
    });
    
  } catch (error) {
    console.error('Equipment alarms error:', error.message);
    res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/location/:plant
 * GET /api/equipment/location/:plant/:area
 * GET /api/equipment/location/:plant/:area/:line
 * Get equipment by location
 */
router.get('/location/:plant', async (req, res) => {
  try {
    const { plant } = req.params;
    console.log(`🏭 Equipment by location request for ${plant} from user: ${req.user.username}`);
    
    const equipment = await equipmentService.getEquipmentByLocation(plant, null, null, req.user);
    
    res.json({
      success: true,
      data: equipment,
      message: `Found ${equipment.length} equipment items at location`
    });
    
  } catch (error) {
    console.error('Equipment by location error:', error.message);
    res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/location/:plant/:area', async (req, res) => {
  try {
    const { plant, area } = req.params;
    console.log(`🏭 Equipment by location request for ${plant}/${area} from user: ${req.user.username}`);
    
    const equipment = await equipmentService.getEquipmentByLocation(plant, area, null, req.user);
    
    res.json({
      success: true,
      data: equipment,
      message: `Found ${equipment.length} equipment items at location`
    });
    
  } catch (error) {
    console.error('Equipment by location error:', error.message);
    res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/location/:plant/:area/:line', async (req, res) => {
  try {
    const { plant, area, line } = req.params;
    console.log(`🏭 Equipment by location request for ${plant}/${area}/${line} from user: ${req.user.username}`);
    
    const equipment = await equipmentService.getEquipmentByLocation(plant, area, line, req.user);
    
    res.json({
      success: true,
      data: equipment,
      message: `Found ${equipment.length} equipment items at location`
    });
    
  } catch (error) {
    console.error('Equipment by location error:', error.message);
    res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Error handling middleware for equipment routes
 */
router.use((error, req, res, next) => {
  console.error('Equipment route error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error in equipment management',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;