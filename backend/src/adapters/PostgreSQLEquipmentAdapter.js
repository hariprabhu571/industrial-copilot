// PostgreSQL Equipment Adapter - Hackathon Implementation
// Phase 29: Industrial AI Copilot - Database Equipment Federation

import { EquipmentAdapter, AdapterHealthStatus } from './EquipmentAdapter.js';
import { Equipment, MaintenanceRecord, EquipmentStatus, EquipmentAlarm } from '../models/equipment.js';

/**
 * PostgreSQL Equipment Adapter
 * Connects to PostgreSQL database for equipment management
 * Simulates enterprise system integration for hackathon demo
 */
export class PostgreSQLEquipmentAdapter extends EquipmentAdapter {
  constructor(config, dbQuery) {
    super(config);
    this.query = dbQuery;
    this.systemName = config.systemName || 'PostgreSQL Equipment System';
  }

  /**
   * Connect to PostgreSQL database
   */
  async connect() {
    try {
      this.log('INFO', 'Connecting to PostgreSQL equipment database...');
      
      // Test connection with a simple query
      const result = await this.query('SELECT NOW() as current_time');
      
      this.isConnected = true;
      this.updateHealthStatus(AdapterHealthStatus.HEALTHY, 'Connected successfully');
      
      this.log('INFO', `Connected successfully at ${result.rows[0].current_time}`);
      return true;
      
    } catch (error) {
      this.isConnected = false;
      this.handleError(error, 'connect');
      return false;
    }
  }

  /**
   * Disconnect from PostgreSQL database
   */
  async disconnect() {
    try {
      this.isConnected = false;
      this.updateHealthStatus(AdapterHealthStatus.DISCONNECTED, 'Disconnected');
      this.log('INFO', 'Disconnected from PostgreSQL equipment database');
      return true;
      
    } catch (error) {
      this.handleError(error, 'disconnect');
      return false;
    }
  }

  /**
   * Get equipment by ID
   */
  async getEquipment(equipmentId) {
    try {
      this.log('INFO', `Getting equipment: ${equipmentId}`);
      
      // Try to determine if equipmentId is a UUID or equipment number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(equipmentId);
      
      let query, params;
      if (isUUID) {
        query = `
          SELECT 
            e.*,
            ec.name as category_name,
            ec.description as category_description,
            el.plant,
            el.area,
            el.line,
            el.station,
            el.functional_location
          FROM equipment e
          LEFT JOIN equipment_categories ec ON e.category_id = ec.id
          LEFT JOIN equipment_locations el ON e.location_id = el.id
          WHERE e.id = $1::uuid
        `;
        params = [equipmentId];
      } else {
        query = `
          SELECT 
            e.*,
            ec.name as category_name,
            ec.description as category_description,
            el.plant,
            el.area,
            el.line,
            el.station,
            el.functional_location
          FROM equipment e
          LEFT JOIN equipment_categories ec ON e.category_id = ec.id
          LEFT JOIN equipment_locations el ON e.location_id = el.id
          WHERE e.equipment_number = $1
        `;
        params = [equipmentId];
      }
      
      const result = await this.query(query, params);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const equipment = new Equipment(result.rows[0]);
      
      // Get specifications
      await this.loadEquipmentSpecifications(equipment);
      
      // Get current status
      await this.loadEquipmentStatus(equipment);
      
      // Get active alarms
      await this.loadEquipmentAlarms(equipment);
      
      this.log('INFO', `Equipment retrieved: ${equipment.equipmentNumber}`);
      return equipment;
      
    } catch (error) {
      this.handleError(error, 'getEquipment');
      return null;
    }
  }

  /**
   * Search equipment by criteria
   */
  async searchEquipment(criteria) {
    try {
      this.log('INFO', 'Searching equipment with criteria', criteria);
      
      const { whereClause, values } = criteria.buildWhereClause();
      
      const query = `
        SELECT 
          e.*,
          ec.name as category_name,
          ec.description as category_description,
          el.plant,
          el.area,
          el.line,
          el.station,
          el.functional_location,
          es.operational_state as status_operational_state,
          es.availability_percentage,
          es.alarm_count,
          es.warning_count
        FROM equipment e
        LEFT JOIN equipment_categories ec ON e.category_id = ec.id
        LEFT JOIN equipment_locations el ON e.location_id = el.id
        LEFT JOIN equipment_status es ON e.id = es.equipment_id
        ${whereClause}
        ORDER BY e.${criteria.sortBy} ${criteria.sortOrder}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;
      
      const queryValues = [...values, criteria.limit, criteria.offset];
      const result = await this.query(query, queryValues);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM equipment e
        LEFT JOIN equipment_categories ec ON e.category_id = ec.id
        LEFT JOIN equipment_locations el ON e.location_id = el.id
        ${whereClause}
      `;
      
      const countResult = await this.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);
      
      const equipment = result.rows.map(row => new Equipment(row));
      
      this.log('INFO', `Equipment search completed: ${equipment.length} results, ${total} total`);
      
      return {
        equipment,
        pagination: {
          page: criteria.page,
          limit: criteria.limit,
          total,
          totalPages: Math.ceil(total / criteria.limit)
        }
      };
      
    } catch (error) {
      this.handleError(error, 'searchEquipment');
      return { equipment: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  }

  /**
   * Get maintenance history for equipment
   */
  async getMaintenanceHistory(equipmentId, options = {}) {
    try {
      this.log('INFO', `Getting maintenance history for equipment: ${equipmentId}`);
      
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      const status = options.status;
      
      // Try to determine if equipmentId is a UUID or equipment number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(equipmentId);
      
      let whereClause, values, paramIndex;
      if (isUUID) {
        whereClause = 'WHERE e.id = $1::uuid';
        values = [equipmentId];
        paramIndex = 2;
      } else {
        whereClause = 'WHERE e.equipment_number = $1';
        values = [equipmentId];
        paramIndex = 2;
      }
      
      if (status) {
        whereClause += ` AND mr.status = $${paramIndex}`;
        values.push(status);
        paramIndex++;
      }
      
      const query = `
        SELECT 
          mr.*,
          e.equipment_number,
          e.name as equipment_name
        FROM maintenance_records mr
        JOIN equipment e ON mr.equipment_id = e.id
        ${whereClause}
        ORDER BY mr.scheduled_date DESC, mr.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      values.push(limit, offset);
      const result = await this.query(query, values);
      
      const maintenanceRecords = result.rows.map(row => new MaintenanceRecord(row));
      
      this.log('INFO', `Maintenance history retrieved: ${maintenanceRecords.length} records`);
      return maintenanceRecords;
      
    } catch (error) {
      this.handleError(error, 'getMaintenanceHistory');
      return [];
    }
  }

  /**
   * Get current equipment status
   */
  async getEquipmentStatus(equipmentId) {
    try {
      this.log('INFO', `Getting status for equipment: ${equipmentId}`);
      
      // Try to determine if equipmentId is a UUID or equipment number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(equipmentId);
      
      let query;
      if (isUUID) {
        query = `
          SELECT es.*
          FROM equipment_status es
          JOIN equipment e ON es.equipment_id = e.id
          WHERE e.id = $1::uuid
          ORDER BY es.status_timestamp DESC
          LIMIT 1
        `;
      } else {
        query = `
          SELECT es.*
          FROM equipment_status es
          JOIN equipment e ON es.equipment_id = e.id
          WHERE e.equipment_number = $1
          ORDER BY es.status_timestamp DESC
          LIMIT 1
        `;
      }
      
      const result = await this.query(query, [equipmentId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const status = new EquipmentStatus(result.rows[0]);
      
      this.log('INFO', `Equipment status retrieved: ${status.operationalState}`);
      return status;
      
    } catch (error) {
      this.handleError(error, 'getEquipmentStatus');
      return null;
    }
  }

  /**
   * Get equipment alarms
   */
  async getEquipmentAlarms(equipmentId, activeOnly = true) {
    try {
      this.log('INFO', `Getting alarms for equipment: ${equipmentId}`);
      
      // Try to determine if equipmentId is a UUID or equipment number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(equipmentId);
      
      let whereClause;
      const values = [equipmentId];
      
      if (isUUID) {
        whereClause = 'WHERE e.id = $1::uuid';
      } else {
        whereClause = 'WHERE e.equipment_number = $1';
      }
      
      if (activeOnly) {
        whereClause += " AND ea.status = 'ACTIVE'";
      }
      
      const query = `
        SELECT ea.*
        FROM equipment_alarms ea
        JOIN equipment e ON ea.equipment_id = e.id
        ${whereClause}
        ORDER BY ea.severity DESC, ea.triggered_at DESC
      `;
      
      const result = await this.query(query, values);
      const alarms = result.rows.map(row => new EquipmentAlarm(row));
      
      this.log('INFO', `Equipment alarms retrieved: ${alarms.length} alarms`);
      return alarms;
      
    } catch (error) {
      this.handleError(error, 'getEquipmentAlarms');
      return [];
    }
  }

  /**
   * Get equipment by location
   */
  async getEquipmentByLocation(plant, area = null, line = null) {
    try {
      this.log('INFO', `Getting equipment by location: ${plant}/${area}/${line}`);
      
      let whereClause = 'WHERE el.plant = $1';
      const values = [plant];
      let paramIndex = 2;
      
      if (area) {
        whereClause += ` AND el.area = $${paramIndex}`;
        values.push(area);
        paramIndex++;
      }
      
      if (line) {
        whereClause += ` AND el.line = $${paramIndex}`;
        values.push(line);
        paramIndex++;
      }
      
      const query = `
        SELECT 
          e.*,
          ec.name as category_name,
          el.plant,
          el.area,
          el.line,
          el.station
        FROM equipment e
        LEFT JOIN equipment_categories ec ON e.category_id = ec.id
        LEFT JOIN equipment_locations el ON e.location_id = el.id
        ${whereClause}
        ORDER BY e.equipment_number
      `;
      
      const result = await this.query(query, values);
      const equipment = result.rows.map(row => new Equipment(row));
      
      this.log('INFO', `Equipment by location retrieved: ${equipment.length} items`);
      return equipment;
      
    } catch (error) {
      this.handleError(error, 'getEquipmentByLocation');
      return [];
    }
  }

  /**
   * Health check for PostgreSQL connection
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      
      // Test basic connectivity
      const result = await this.query('SELECT 1 as health_check');
      
      // Test equipment table access
      const equipmentCount = await this.query('SELECT COUNT(*) as count FROM equipment');
      
      const responseTime = Date.now() - startTime;
      
      const healthInfo = {
        status: AdapterHealthStatus.HEALTHY,
        responseTime: `${responseTime}ms`,
        equipmentCount: equipmentCount.rows[0].count,
        timestamp: new Date().toISOString()
      };
      
      this.updateHealthStatus(AdapterHealthStatus.HEALTHY, `Health check passed in ${responseTime}ms`);
      
      return healthInfo;
      
    } catch (error) {
      const healthInfo = {
        status: AdapterHealthStatus.ERROR,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.updateHealthStatus(AdapterHealthStatus.ERROR, `Health check failed: ${error.message}`);
      
      return healthInfo;
    }
  }

  /**
   * Load equipment specifications
   */
  async loadEquipmentSpecifications(equipment) {
    try {
      const query = `
        SELECT * FROM equipment_specifications
        WHERE equipment_id = $1
        ORDER BY spec_type, spec_name
      `;
      
      const result = await this.query(query, [equipment.id]);
      
      result.rows.forEach(row => {
        equipment.addSpecification(row);
      });
      
    } catch (error) {
      this.log('WARNING', `Failed to load specifications for equipment ${equipment.equipmentNumber}: ${error.message}`);
    }
  }

  /**
   * Load equipment status
   */
  async loadEquipmentStatus(equipment) {
    try {
      const status = await this.getEquipmentStatusByUUID(equipment.id);
      equipment.status = status;
      
    } catch (error) {
      this.log('WARNING', `Failed to load status for equipment ${equipment.equipmentNumber}: ${error.message}`);
    }
  }

  /**
   * Load equipment alarms
   */
  async loadEquipmentAlarms(equipment) {
    try {
      const alarms = await this.getEquipmentAlarmsByUUID(equipment.id, true);
      equipment.alarms = alarms;
      
    } catch (error) {
      this.log('WARNING', `Failed to load alarms for equipment ${equipment.equipmentNumber}: ${error.message}`);
    }
  }

  /**
   * Get equipment status by UUID (internal method)
   */
  async getEquipmentStatusByUUID(equipmentUUID) {
    try {
      const query = `
        SELECT es.*
        FROM equipment_status es
        WHERE es.equipment_id = $1::uuid
        ORDER BY es.status_timestamp DESC
        LIMIT 1
      `;
      
      const result = await this.query(query, [equipmentUUID]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new EquipmentStatus(result.rows[0]);
      
    } catch (error) {
      this.handleError(error, 'getEquipmentStatusByUUID');
      return null;
    }
  }

  /**
   * Get equipment alarms by UUID (internal method)
   */
  async getEquipmentAlarmsByUUID(equipmentUUID, activeOnly = true) {
    try {
      let whereClause = 'WHERE ea.equipment_id = $1::uuid';
      const values = [equipmentUUID];
      
      if (activeOnly) {
        whereClause += " AND ea.status = 'ACTIVE'";
      }
      
      const query = `
        SELECT ea.*
        FROM equipment_alarms ea
        ${whereClause}
        ORDER BY ea.severity DESC, ea.triggered_at DESC
      `;
      
      const result = await this.query(query, values);
      return result.rows.map(row => new EquipmentAlarm(row));
      
    } catch (error) {
      this.handleError(error, 'getEquipmentAlarmsByUUID');
      return [];
    }
  }

  /**
   * Get equipment statistics
   */
  async getEquipmentStatistics() {
    try {
      this.log('INFO', 'Getting equipment statistics');
      
      const queries = {
        total: 'SELECT COUNT(*) as count FROM equipment',
        operational: "SELECT COUNT(*) as count FROM equipment WHERE operational_state = 'OPERATIONAL'",
        maintenance: "SELECT COUNT(*) as count FROM equipment WHERE operational_state = 'MAINTENANCE'",
        offline: "SELECT COUNT(*) as count FROM equipment WHERE operational_state = 'OFFLINE'",
        alarm: "SELECT COUNT(*) as count FROM equipment WHERE operational_state = 'ALARM'",
        critical: "SELECT COUNT(*) as count FROM equipment WHERE criticality = 'CRITICAL'",
        activeAlarms: "SELECT COUNT(*) as count FROM equipment_alarms WHERE status = 'ACTIVE'",
        scheduledMaintenance: "SELECT COUNT(*) as count FROM maintenance_records WHERE status = 'SCHEDULED'"
      };
      
      const results = {};
      
      for (const [key, query] of Object.entries(queries)) {
        const result = await this.query(query);
        results[key] = parseInt(result.rows[0].count);
      }
      
      this.log('INFO', 'Equipment statistics retrieved', results);
      return results;
      
    } catch (error) {
      this.handleError(error, 'getEquipmentStatistics');
      return {};
    }
  }
}

export default PostgreSQLEquipmentAdapter;