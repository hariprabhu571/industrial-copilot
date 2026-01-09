/**
 * PostgreSQL Error Code Adapter
 * Phase 32: Error Code & Troubleshooting System
 */

import { ErrorCode, TroubleshootingProcedure, ErrorResolution } from '../models/errorCode.js';

class PostgreSQLErrorCodeAdapter {
  constructor(dbQuery) {
    this.query = dbQuery;
  }

  // Error Code Operations
  async getAllErrorCodes(filters = {}) {
    try {
      let query = `
        SELECT ec.*, e.name as equipment_name, e.type as equipment_type
        FROM error_codes ec
        LEFT JOIN equipment e ON ec.equipment_id = e.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      // Apply filters
      if (filters.code) {
        paramCount++;
        query += ` AND ec.code ILIKE $${paramCount}`;
        params.push(`%${filters.code}%`);
      }

      if (filters.equipmentId) {
        paramCount++;
        query += ` AND ec.equipment_id = $${paramCount}`;
        params.push(filters.equipmentId);
      }

      if (filters.severityLevel) {
        paramCount++;
        query += ` AND ec.severity_level = $${paramCount}`;
        params.push(filters.severityLevel);
      }

      if (filters.category) {
        paramCount++;
        query += ` AND ec.category = $${paramCount}`;
        params.push(filters.category);
      }

      if (filters.search) {
        paramCount++;
        query += ` AND (ec.code ILIKE $${paramCount} OR ec.title ILIKE $${paramCount} OR ec.description ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }

      // Sorting
      const sortBy = filters.sortBy || 'frequency_count';
      const sortOrder = filters.sortOrder || 'DESC';
      query += ` ORDER BY ec.${sortBy} ${sortOrder}`;

      // Pagination
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      if (filters.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }

      const result = await this.query(query, params);
      return result.rows.map(row => ({
        ...ErrorCode.fromDatabase(row).toJSON(),
        equipmentName: row.equipment_name,
        equipmentType: row.equipment_type
      }));
    } catch (error) {
      console.error('Error fetching error codes:', error);
      throw new Error('Failed to fetch error codes');
    }
  }

  async getErrorCodeByCode(code) {
    try {
      const query = `
        SELECT ec.*, e.name as equipment_name, e.type as equipment_type
        FROM error_codes ec
        LEFT JOIN equipment e ON ec.equipment_id = e.id
        WHERE ec.code = $1
      `;
      const result = await this.query(query, [code]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...ErrorCode.fromDatabase(row).toJSON(),
        equipmentName: row.equipment_name,
        equipmentType: row.equipment_type
      };
    } catch (error) {
      console.error('Error fetching error code by code:', error);
      throw new Error('Failed to fetch error code');
    }
  }

  async getErrorCodeById(id) {
    try {
      const query = `
        SELECT ec.*, e.name as equipment_name, e.type as equipment_type
        FROM error_codes ec
        LEFT JOIN equipment e ON ec.equipment_id = e.id
        WHERE ec.id = $1
      `;
      const result = await this.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...ErrorCode.fromDatabase(row).toJSON(),
        equipmentName: row.equipment_name,
        equipmentType: row.equipment_type
      };
    } catch (error) {
      console.error('Error fetching error code by ID:', error);
      throw new Error('Failed to fetch error code');
    }
  }

  // Troubleshooting Procedure Operations
  async getTroubleshootingProcedures(errorCodeId) {
    try {
      const query = `
        SELECT * FROM troubleshooting_procedures
        WHERE error_code_id = $1
        ORDER BY step_number ASC
      `;
      const result = await this.query(query, [errorCodeId]);
      return result.rows.map(row => TroubleshootingProcedure.fromDatabase(row).toJSON());
    } catch (error) {
      console.error('Error fetching troubleshooting procedures:', error);
      throw new Error('Failed to fetch troubleshooting procedures');
    }
  }

  async getTroubleshootingProceduresByCode(code) {
    try {
      const query = `
        SELECT tp.* FROM troubleshooting_procedures tp
        JOIN error_codes ec ON tp.error_code_id = ec.id
        WHERE ec.code = $1
        ORDER BY tp.step_number ASC
      `;
      const result = await this.query(query, [code]);
      return result.rows.map(row => TroubleshootingProcedure.fromDatabase(row).toJSON());
    } catch (error) {
      console.error('Error fetching troubleshooting procedures by code:', error);
      throw new Error('Failed to fetch troubleshooting procedures');
    }
  }

  // Error Resolution Operations
  async createErrorResolution(resolutionData) {
    try {
      const query = `
        INSERT INTO error_resolutions (
          error_code_id, equipment_id, user_id, resolution_time_minutes,
          successful, procedure_steps_followed, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const params = [
        resolutionData.errorCodeId,
        resolutionData.equipmentId,
        resolutionData.userId,
        resolutionData.resolutionTimeMinutes,
        resolutionData.successful,
        resolutionData.procedureStepsFollowed || [],
        resolutionData.notes
      ];

      const result = await this.query(query, params);
      
      // Update error code statistics
      await this.updateErrorCodeStatistics(resolutionData.errorCodeId);
      
      return ErrorResolution.fromDatabase(result.rows[0]).toJSON();
    } catch (error) {
      console.error('Error creating error resolution:', error);
      throw new Error('Failed to create error resolution');
    }
  }

  async getErrorResolutions(errorCodeId, limit = 10) {
    try {
      const query = `
        SELECT er.*, e.name as equipment_name
        FROM error_resolutions er
        LEFT JOIN equipment e ON er.equipment_id = e.id
        WHERE er.error_code_id = $1
        ORDER BY er.resolved_at DESC
        LIMIT $2
      `;
      const result = await this.query(query, [errorCodeId, limit]);
      return result.rows.map(row => ({
        ...ErrorResolution.fromDatabase(row).toJSON(),
        equipmentName: row.equipment_name
      }));
    } catch (error) {
      console.error('Error fetching error resolutions:', error);
      throw new Error('Failed to fetch error resolutions');
    }
  }

  // Statistics and Analytics
  async updateErrorCodeStatistics(errorCodeId) {
    try {
      const query = `
        UPDATE error_codes SET
          frequency_count = (
            SELECT COUNT(*) FROM error_resolutions WHERE error_code_id = $1
          ),
          avg_resolution_time_minutes = (
            SELECT ROUND(AVG(resolution_time_minutes))
            FROM error_resolutions 
            WHERE error_code_id = $1 AND successful = true
          )
        WHERE id = $1
      `;
      await this.query(query, [errorCodeId]);
    } catch (error) {
      console.error('Error updating error code statistics:', error);
      throw new Error('Failed to update error code statistics');
    }
  }

  async getErrorCodeStatistics() {
    try {
      const query = `
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
      const result = await this.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching error code statistics:', error);
      throw new Error('Failed to fetch error code statistics');
    }
  }

  async getTopErrorCodes(limit = 10) {
    try {
      const query = `
        SELECT ec.*, e.name as equipment_name
        FROM error_codes ec
        LEFT JOIN equipment e ON ec.equipment_id = e.id
        ORDER BY ec.frequency_count DESC
        LIMIT $1
      `;
      const result = await this.query(query, [limit]);
      return result.rows.map(row => ({
        ...ErrorCode.fromDatabase(row).toJSON(),
        equipmentName: row.equipment_name
      }));
    } catch (error) {
      console.error('Error fetching top error codes:', error);
      throw new Error('Failed to fetch top error codes');
    }
  }

  async searchErrorCodes(searchTerm, limit = 20) {
    try {
      const query = `
        SELECT ec.*, e.name as equipment_name, e.type as equipment_type
        FROM error_codes ec
        LEFT JOIN equipment e ON ec.equipment_id = e.id
        WHERE ec.code ILIKE $1 
           OR ec.title ILIKE $1 
           OR ec.description ILIKE $1
           OR ec.category ILIKE $1
        ORDER BY 
          CASE WHEN ec.code ILIKE $1 THEN 1 ELSE 2 END,
          ec.frequency_count DESC
        LIMIT $2
      `;
      const searchPattern = `%${searchTerm}%`;
      const result = await this.query(query, [searchPattern, limit]);
      return result.rows.map(row => ({
        ...ErrorCode.fromDatabase(row).toJSON(),
        equipmentName: row.equipment_name,
        equipmentType: row.equipment_type
      }));
    } catch (error) {
      console.error('Error searching error codes:', error);
      throw new Error('Failed to search error codes');
    }
  }
}

export default PostgreSQLErrorCodeAdapter;
