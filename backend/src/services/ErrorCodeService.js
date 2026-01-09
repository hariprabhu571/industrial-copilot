import PostgreSQLErrorCodeAdapter from '../adapters/PostgreSQLErrorCodeAdapter.js';
import { SEVERITY_LEVELS, ERROR_CATEGORIES } from '../models/errorCode.js';

export default class ErrorCodeService {
  constructor(dbQuery) {
    this.query = dbQuery.query || dbQuery;
    this.adapter = new PostgreSQLErrorCodeAdapter(this.query);
  }

  async getAllErrorCodes(filters = {}) {
    try {
      if (filters.severityLevel && !Object.values(SEVERITY_LEVELS).includes(filters.severityLevel)) {
        throw new Error('Invalid severity level');
      }
      if (filters.category && !Object.values(ERROR_CATEGORIES).includes(filters.category)) {
        throw new Error('Invalid category');
      }
      return await this.adapter.getAllErrorCodes(filters);
    } catch (error) {
      console.error('ErrorCodeService - getAllErrorCodes error:', error);
      throw error;
    }
  }

  async getErrorCodeByCode(code) {
    try {
      if (!code || typeof code !== 'string') {
        throw new Error('Valid error code is required');
      }
      const errorCode = await this.adapter.getErrorCodeByCode(code.toUpperCase());
      if (!errorCode) {
        throw new Error('Error code not found');
      }
      return errorCode;
    } catch (error) {
      console.error('ErrorCodeService - getErrorCodeByCode error:', error);
      throw error;
    }
  }

  async getErrorCodeById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Valid error code ID is required');
      }
      const errorCode = await this.adapter.getErrorCodeById(parseInt(id));
      if (!errorCode) {
        throw new Error('Error code not found');
      }
      return errorCode;
    } catch (error) {
      console.error('ErrorCodeService - getErrorCodeById error:', error);
      throw error;
    }
  }

  async searchErrorCodes(searchTerm, limit = 20) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
        throw new Error('Search term is required');
      }
      return await this.adapter.searchErrorCodes(searchTerm.trim(), limit);
    } catch (error) {
      console.error('ErrorCodeService - searchErrorCodes error:', error);
      throw error;
    }
  }

  async getTroubleshootingProcedures(errorCodeId) {
    try {
      if (!errorCodeId || isNaN(errorCodeId)) {
        throw new Error('Valid error code ID is required');
      }
      return await this.adapter.getTroubleshootingProcedures(parseInt(errorCodeId));
    } catch (error) {
      console.error('ErrorCodeService - getTroubleshootingProcedures error:', error);
      throw error;
    }
  }

  async getTroubleshootingProceduresByCode(code) {
    try {
      if (!code || typeof code !== 'string') {
        throw new Error('Valid error code is required');
      }
      return await this.adapter.getTroubleshootingProceduresByCode(code.toUpperCase());
    } catch (error) {
      console.error('ErrorCodeService - getTroubleshootingProceduresByCode error:', error);
      throw error;
    }
  }

  async getErrorCodeStatistics() {
    try {
      const stats = await this.adapter.getErrorCodeStatistics();
      return {
        totalErrorCodes: parseInt(stats.total_error_codes) || 0,
        criticalErrors: parseInt(stats.critical_errors) || 0,
        highErrors: parseInt(stats.high_errors) || 0,
        mediumErrors: parseInt(stats.medium_errors) || 0,
        lowErrors: parseInt(stats.low_errors) || 0,
        avgFrequency: parseFloat(stats.avg_frequency) || 0,
        avgResolutionTime: parseFloat(stats.avg_resolution_time) || 0
      };
    } catch (error) {
      console.error('ErrorCodeService - getErrorCodeStatistics error:', error);
      throw error;
    }
  }

  async getTopErrorCodes(limit = 10) {
    try {
      if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
        throw new Error('Limit must be between 1 and 100');
      }
      return await this.adapter.getTopErrorCodes(limit);
    } catch (error) {
      console.error('ErrorCodeService - getTopErrorCodes error:', error);
      throw error;
    }
  }

  async getErrorCodeWithFullDetails(code) {
    try {
      const errorCode = await this.getErrorCodeByCode(code);
      const procedures = await this.getTroubleshootingProceduresByCode(code);
      return {
        ...errorCode,
        procedures,
        totalSteps: procedures.length,
        estimatedTotalTime: procedures.reduce((sum, proc) => sum + (proc.estimatedTimeMinutes || 0), 0)
      };
    } catch (error) {
      console.error('ErrorCodeService - getErrorCodeWithFullDetails error:', error);
      throw error;
    }
  }

  async quickLookup(searchTerm) {
    try {
      try {
        const exactMatch = await this.getErrorCodeByCode(searchTerm);
        if (exactMatch) {
          return {
            type: 'exact',
            result: await this.getErrorCodeWithFullDetails(searchTerm)
          };
        }
      } catch (error) {
        // Continue to search if exact match fails
      }
      const searchResults = await this.searchErrorCodes(searchTerm, 5);
      return {
        type: 'search',
        results: searchResults
      };
    } catch (error) {
      console.error('ErrorCodeService - quickLookup error:', error);
      throw error;
    }
  }

  getSeverityLevels() {
    return Object.values(SEVERITY_LEVELS);
  }

  getErrorCategories() {
    return Object.values(ERROR_CATEGORIES);
  }
}