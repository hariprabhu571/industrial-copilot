// Equipment Adapter Pattern - Base Class
// Phase 29: Industrial AI Copilot - Multi-System Equipment Federation

/**
 * Base Equipment Adapter Class
 * Abstract class for connecting to different enterprise systems
 */
export class EquipmentAdapter {
  constructor(config) {
    this.config = config;
    this.systemName = config.systemName;
    this.isConnected = false;
    this.lastHealthCheck = null;
    this.healthStatus = 'UNKNOWN';
  }

  /**
   * Connect to the enterprise system
   * Must be implemented by concrete adapters
   */
  async connect() {
    throw new Error('connect() method must be implemented by concrete adapter');
  }

  /**
   * Disconnect from the enterprise system
   * Must be implemented by concrete adapters
   */
  async disconnect() {
    throw new Error('disconnect() method must be implemented by concrete adapter');
  }

  /**
   * Get equipment by ID
   * Must be implemented by concrete adapters
   */
  async getEquipment(equipmentId) {
    throw new Error('getEquipment() method must be implemented by concrete adapter');
  }

  /**
   * Search equipment by criteria
   * Must be implemented by concrete adapters
   */
  async searchEquipment(criteria) {
    throw new Error('searchEquipment() method must be implemented by concrete adapter');
  }

  /**
   * Get maintenance history for equipment
   * Must be implemented by concrete adapters
   */
  async getMaintenanceHistory(equipmentId) {
    throw new Error('getMaintenanceHistory() method must be implemented by concrete adapter');
  }

  /**
   * Get current equipment status
   * Must be implemented by concrete adapters
   */
  async getEquipmentStatus(equipmentId) {
    throw new Error('getEquipmentStatus() method must be implemented by concrete adapter');
  }

  /**
   * Health check for the adapter connection
   * Must be implemented by concrete adapters
   */
  async healthCheck() {
    throw new Error('healthCheck() method must be implemented by concrete adapter');
  }

  /**
   * Get adapter information
   */
  getAdapterInfo() {
    return {
      systemName: this.systemName,
      isConnected: this.isConnected,
      lastHealthCheck: this.lastHealthCheck,
      healthStatus: this.healthStatus,
      config: {
        ...this.config,
        // Remove sensitive information
        password: this.config.password ? '***' : undefined,
        apiKey: this.config.apiKey ? '***' : undefined
      }
    };
  }

  /**
   * Update health status
   */
  updateHealthStatus(status, message = null) {
    this.healthStatus = status;
    this.lastHealthCheck = new Date();
    
    if (message) {
      console.log(`[${this.systemName}] Health Status: ${status} - ${message}`);
    }
  }

  /**
   * Transform raw data to standard equipment format
   * Can be overridden by concrete adapters
   */
  transformEquipmentData(rawData) {
    return rawData;
  }

  /**
   * Transform raw maintenance data to standard format
   * Can be overridden by concrete adapters
   */
  transformMaintenanceData(rawData) {
    return rawData;
  }

  /**
   * Transform raw status data to standard format
   * Can be overridden by concrete adapters
   */
  transformStatusData(rawData) {
    return rawData;
  }

  /**
   * Handle adapter errors
   */
  handleError(error, operation) {
    console.error(`[${this.systemName}] Error in ${operation}:`, error.message);
    this.updateHealthStatus('ERROR', `${operation} failed: ${error.message}`);
    throw error;
  }

  /**
   * Log adapter operations
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.systemName}] [${level}] ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
}

/**
 * Adapter Health Status Constants
 */
export const AdapterHealthStatus = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  UNKNOWN: 'UNKNOWN',
  DISCONNECTED: 'DISCONNECTED'
};

/**
 * Adapter Configuration Interface
 */
export class AdapterConfig {
  constructor(config) {
    this.systemName = config.systemName;
    this.type = config.type; // 'postgresql', 'sap', 'maximo', 'mes', 'scada'
    this.connectionString = config.connectionString;
    this.host = config.host;
    this.port = config.port;
    this.database = config.database;
    this.username = config.username;
    this.password = config.password;
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.healthCheckInterval = config.healthCheckInterval || 300000; // 5 minutes
    this.enabled = config.enabled !== false;
  }

  /**
   * Validate adapter configuration
   */
  validate() {
    if (!this.systemName) {
      throw new Error('systemName is required in adapter configuration');
    }

    if (!this.type) {
      throw new Error('type is required in adapter configuration');
    }

    // Type-specific validation
    switch (this.type) {
      case 'postgresql':
        if (!this.host || !this.database || !this.username) {
          throw new Error('PostgreSQL adapter requires host, database, and username');
        }
        break;
      
      case 'sap':
        if (!this.host || !this.username) {
          throw new Error('SAP adapter requires host and username');
        }
        break;
      
      case 'maximo':
        if (!this.apiUrl || !this.apiKey) {
          throw new Error('Maximo adapter requires apiUrl and apiKey');
        }
        break;
      
      case 'mes':
        if (!this.apiUrl) {
          throw new Error('MES adapter requires apiUrl');
        }
        break;
      
      case 'scada':
        if (!this.host || !this.port) {
          throw new Error('SCADA adapter requires host and port');
        }
        break;
      
      default:
        throw new Error(`Unknown adapter type: ${this.type}`);
    }

    return true;
  }
}

export default EquipmentAdapter;