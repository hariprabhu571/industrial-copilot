// Equipment Service Layer - Business Logic with Permissions
// Phase 29: Industrial AI Copilot - Equipment Management Service

import { EquipmentSearchCriteria, UserEquipmentPermissions } from '../models/equipment.js';
import PostgreSQLEquipmentAdapter from '../adapters/PostgreSQLEquipmentAdapter.js';
import { AdapterConfig } from '../adapters/EquipmentAdapter.js';

/**
 * Equipment Service
 * Handles equipment management business logic with permission-based access
 */
export class EquipmentService {
  constructor(dbQuery) {
    this.query = dbQuery;
    this.adapters = new Map();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Initialize PostgreSQL adapter for hackathon demo
    this.initializeAdapters();
  }

  /**
   * Initialize equipment adapters
   */
  async initializeAdapters() {
    try {
      // PostgreSQL adapter (primary for hackathon)
      const pgConfig = new AdapterConfig({
        systemName: 'PostgreSQL Equipment System',
        type: 'postgresql',
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        username: process.env.POSTGRES_USER,
        enabled: true
      });

      const pgAdapter = new PostgreSQLEquipmentAdapter(pgConfig, this.query);
      await pgAdapter.connect();
      
      this.adapters.set('postgresql', pgAdapter);
      
      console.log('✅ Equipment adapters initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize equipment adapters:', error.message);
    }
  }

  /**
   * Get user permissions for equipment access
   */
  async getUserPermissions(userId) {
    try {
      const query = `
        SELECT 
          u.id as user_id,
          u.role,
          u.equipment_role,
          u.accessible_plants,
          u.accessible_areas,
          u.accessible_lines,
          u.assigned_equipment,
          u.department
        FROM users u
        WHERE u.id = $1::uuid
      `;
      
      const result = await this.query(query, [userId]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return new UserEquipmentPermissions(result.rows[0]);
      
    } catch (error) {
      console.error('Error getting user permissions:', error.message);
      throw error;
    }
  }

  /**
   * Search equipment with permission filtering
   */
  async searchEquipment(searchParams, user) {
    try {
      console.log(`🔍 Equipment search by user: ${user.username}`);
      
      // Get user permissions
      const permissions = await this.getUserPermissions(user.id);
      
      // Build search criteria
      const criteria = new EquipmentSearchCriteria(searchParams);
      
      // Apply permission-based filtering to search criteria
      this.applyPermissionFilters(criteria, permissions);
      
      // Get primary adapter (PostgreSQL)
      const adapter = this.adapters.get('postgresql');
      if (!adapter) {
        throw new Error('Equipment adapter not available');
      }
      
      // Search equipment
      const result = await adapter.searchEquipment(criteria);
      
      // Filter results based on user permissions
      const filteredEquipment = result.equipment.filter(equipment => 
        permissions.canAccessEquipment(equipment)
      );
      
      // Update pagination for filtered results
      const filteredResult = {
        equipment: filteredEquipment,
        pagination: {
          ...result.pagination,
          filteredCount: filteredEquipment.length
        }
      };
      
      console.log(`✅ Equipment search completed: ${filteredEquipment.length} results for user ${user.username}`);
      
      return filteredResult;
      
    } catch (error) {
      console.error('Error searching equipment:', error.message);
      throw error;
    }
  }

  /**
   * Get equipment by ID with permission check
   */
  async getEquipmentById(equipmentId, user) {
    try {
      console.log(`🔍 Getting equipment ${equipmentId} for user: ${user.username}`);
      
      // Get user permissions
      const permissions = await this.getUserPermissions(user.id);
      
      // Get equipment from adapter
      const adapter = this.adapters.get('postgresql');
      if (!adapter) {
        throw new Error('Equipment adapter not available');
      }
      
      const equipment = await adapter.getEquipment(equipmentId);
      
      if (!equipment) {
        return null;
      }
      
      // Check permissions
      if (!permissions.canAccessEquipment(equipment)) {
        throw new Error('Access denied: Insufficient permissions for this equipment');
      }
      
      // Filter sensitive data based on permissions
      this.filterEquipmentData(equipment, permissions);
      
      console.log(`✅ Equipment retrieved: ${equipment.equipmentNumber} for user ${user.username}`);
      
      return equipment;
      
    } catch (error) {
      console.error('Error getting equipment:', error.message);
      throw error;
    }
  }

  /**
   * Get maintenance history with permission check
   */
  async getMaintenanceHistory(equipmentId, user, options = {}) {
    try {
      console.log(`🔧 Getting maintenance history for ${equipmentId} by user: ${user.username}`);
      
      // Get user permissions
      const permissions = await this.getUserPermissions(user.id);
      
      // Check if user can view maintenance data
      if (!permissions.canViewMaintenance()) {
        throw new Error('Access denied: Insufficient permissions to view maintenance data');
      }
      
      // First check if user can access the equipment
      const equipment = await this.getEquipmentById(equipmentId, user);
      if (!equipment) {
        throw new Error('Equipment not found or access denied');
      }
      
      // Get maintenance history from adapter
      const adapter = this.adapters.get('postgresql');
      const maintenanceRecords = await adapter.getMaintenanceHistory(equipmentId, options);
      
      // Filter cost data if user doesn't have permission
      if (!permissions.canViewCostData()) {
        maintenanceRecords.forEach(record => {
          record.materialCost = null;
          record.laborCost = null;
          record.totalCost = null;
        });
      }
      
      console.log(`✅ Maintenance history retrieved: ${maintenanceRecords.length} records`);
      
      return maintenanceRecords;
      
    } catch (error) {
      console.error('Error getting maintenance history:', error.message);
      throw error;
    }
  }

  /**
   * Get equipment status with permission check
   */
  async getEquipmentStatus(equipmentId, user) {
    try {
      console.log(`📊 Getting equipment status for ${equipmentId} by user: ${user.username}`);
      
      // Check equipment access first
      const equipment = await this.getEquipmentById(equipmentId, user);
      if (!equipment) {
        throw new Error('Equipment not found or access denied');
      }
      
      // Get status from adapter
      const adapter = this.adapters.get('postgresql');
      const status = await adapter.getEquipmentStatus(equipmentId);
      
      console.log(`✅ Equipment status retrieved for ${equipmentId}`);
      
      return status;
      
    } catch (error) {
      console.error('Error getting equipment status:', error.message);
      throw error;
    }
  }

  /**
   * Get equipment alarms with permission check
   */
  async getEquipmentAlarms(equipmentId, user, activeOnly = true) {
    try {
      console.log(`🚨 Getting equipment alarms for ${equipmentId} by user: ${user.username}`);
      
      // Check equipment access first
      const equipment = await this.getEquipmentById(equipmentId, user);
      if (!equipment) {
        throw new Error('Equipment not found or access denied');
      }
      
      // Get alarms from adapter
      const adapter = this.adapters.get('postgresql');
      const alarms = await adapter.getEquipmentAlarms(equipmentId, activeOnly);
      
      console.log(`✅ Equipment alarms retrieved: ${alarms.length} alarms`);
      
      return alarms;
      
    } catch (error) {
      console.error('Error getting equipment alarms:', error.message);
      throw error;
    }
  }

  /**
   * Get equipment by location with permission filtering
   */
  async getEquipmentByLocation(plant, area, line, user) {
    try {
      console.log(`🏭 Getting equipment by location ${plant}/${area}/${line} for user: ${user.username}`);
      
      // Get user permissions
      const permissions = await this.getUserPermissions(user.id);
      
      // Check location access
      if (!this.canAccessLocation(permissions, plant, area, line)) {
        throw new Error('Access denied: Insufficient permissions for this location');
      }
      
      // Get equipment from adapter
      const adapter = this.adapters.get('postgresql');
      const equipment = await adapter.getEquipmentByLocation(plant, area, line);
      
      // Filter based on user permissions
      const filteredEquipment = equipment.filter(eq => permissions.canAccessEquipment(eq));
      
      console.log(`✅ Equipment by location retrieved: ${filteredEquipment.length} items`);
      
      return filteredEquipment;
      
    } catch (error) {
      console.error('Error getting equipment by location:', error.message);
      throw error;
    }
  }

  /**
   * Get equipment statistics with permission filtering
   */
  async getEquipmentStatistics(user) {
    try {
      console.log(`📈 Getting equipment statistics for user: ${user.username}`);
      
      // Get user permissions
      const permissions = await this.getUserPermissions(user.id);
      
      // Get base statistics from adapter
      const adapter = this.adapters.get('postgresql');
      const baseStats = await adapter.getEquipmentStatistics();
      
      // If user is admin, return full statistics
      if (permissions.role === 'admin') {
        return baseStats;
      }
      
      // For non-admin users, get filtered statistics
      const searchCriteria = new EquipmentSearchCriteria({ limit: 1000 });
      this.applyPermissionFilters(searchCriteria, permissions);
      
      const result = await adapter.searchEquipment(searchCriteria);
      const accessibleEquipment = result.equipment.filter(eq => permissions.canAccessEquipment(eq));
      
      // Calculate filtered statistics
      const filteredStats = {
        total: accessibleEquipment.length,
        operational: accessibleEquipment.filter(eq => eq.operationalState === 'OPERATIONAL').length,
        maintenance: accessibleEquipment.filter(eq => eq.operationalState === 'MAINTENANCE').length,
        offline: accessibleEquipment.filter(eq => eq.operationalState === 'OFFLINE').length,
        alarm: accessibleEquipment.filter(eq => eq.operationalState === 'ALARM').length,
        critical: accessibleEquipment.filter(eq => eq.criticality === 'CRITICAL').length
      };
      
      console.log(`✅ Equipment statistics retrieved for user ${user.username}`);
      
      return filteredStats;
      
    } catch (error) {
      console.error('Error getting equipment statistics:', error.message);
      throw error;
    }
  }

  /**
   * Get adapter health status
   */
  async getAdapterHealth() {
    try {
      const healthStatus = {};
      
      for (const [name, adapter] of this.adapters) {
        healthStatus[name] = await adapter.healthCheck();
      }
      
      return healthStatus;
      
    } catch (error) {
      console.error('Error getting adapter health:', error.message);
      throw error;
    }
  }

  /**
   * Apply permission-based filters to search criteria
   */
  applyPermissionFilters(criteria, permissions) {
    // Admin can access everything
    if (permissions.role === 'admin') {
      return;
    }
    
    // Apply plant filter
    if (permissions.accessiblePlants.length > 0) {
      if (!criteria.plant) {
        criteria.plant = permissions.accessiblePlants[0]; // Default to first accessible plant
      } else if (!permissions.accessiblePlants.includes(criteria.plant)) {
        throw new Error('Access denied: Cannot access specified plant');
      }
    }
    
    // Apply area filter
    if (permissions.accessibleAreas.length > 0) {
      if (!criteria.area) {
        criteria.area = permissions.accessibleAreas[0]; // Default to first accessible area
      } else if (!permissions.accessibleAreas.includes(criteria.area)) {
        throw new Error('Access denied: Cannot access specified area');
      }
    }
    
    // Apply line filter
    if (permissions.accessibleLines.length > 0 && criteria.line) {
      if (!permissions.accessibleLines.includes(criteria.line)) {
        throw new Error('Access denied: Cannot access specified line');
      }
    }
  }

  /**
   * Filter equipment data based on user permissions
   */
  filterEquipmentData(equipment, permissions) {
    // Remove technical specifications if user doesn't have permission
    if (!permissions.canViewTechnicalSpecs()) {
      equipment.specifications = equipment.specifications.filter(spec => 
        spec.specType !== 'TECHNICAL'
      );
    }
    
    // Remove cost-related data if user doesn't have permission
    if (!permissions.canViewCostData() && equipment.status) {
      // Remove any cost-related performance data
      if (equipment.status.performanceData) {
        delete equipment.status.performanceData.cost;
        delete equipment.status.performanceData.maintenance_cost;
      }
    }
  }

  /**
   * Check if user can access specific location
   */
  canAccessLocation(permissions, plant, area, line) {
    // Admin can access everything
    if (permissions.role === 'admin') {
      return true;
    }
    
    // Check plant access
    if (permissions.accessiblePlants.length > 0 && !permissions.accessiblePlants.includes(plant)) {
      return false;
    }
    
    // Check area access
    if (area && permissions.accessibleAreas.length > 0 && !permissions.accessibleAreas.includes(area)) {
      return false;
    }
    
    // Check line access
    if (line && permissions.accessibleLines.length > 0 && !permissions.accessibleLines.includes(line)) {
      return false;
    }
    
    return true;
  }

  /**
   * Cache management
   */
  getCacheKey(operation, params) {
    return `${operation}:${JSON.stringify(params)}`;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clearCache() {
    this.cache.clear();
  }
}

export default EquipmentService;