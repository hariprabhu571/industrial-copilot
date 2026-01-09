/**
 * Error Code Data Models
 * Phase 32: Error Code & Troubleshooting System
 */

class ErrorCode {
  constructor({
    id,
    code,
    equipmentId,
    severityLevel,
    title,
    description,
    category,
    frequencyCount = 0,
    avgResolutionTimeMinutes,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.code = code;
    this.equipmentId = equipmentId;
    this.severityLevel = severityLevel;
    this.title = title;
    this.description = description;
    this.category = category;
    this.frequencyCount = frequencyCount;
    this.avgResolutionTimeMinutes = avgResolutionTimeMinutes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDatabase(row) {
    return new ErrorCode({
      id: row.id,
      code: row.code,
      equipmentId: row.equipment_id,
      severityLevel: row.severity_level,
      title: row.title,
      description: row.description,
      category: row.category,
      frequencyCount: row.frequency_count,
      avgResolutionTimeMinutes: row.avg_resolution_time_minutes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      equipmentId: this.equipmentId,
      severityLevel: this.severityLevel,
      title: this.title,
      description: this.description,
      category: this.category,
      frequencyCount: this.frequencyCount,
      avgResolutionTimeMinutes: this.avgResolutionTimeMinutes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

class TroubleshootingProcedure {
  constructor({
    id,
    errorCodeId,
    stepNumber,
    title,
    instruction,
    estimatedTimeMinutes = 5,
    requiredTools = [],
    safetyNotes,
    successRate = 0.0,
    createdAt
  }) {
    this.id = id;
    this.errorCodeId = errorCodeId;
    this.stepNumber = stepNumber;
    this.title = title;
    this.instruction = instruction;
    this.estimatedTimeMinutes = estimatedTimeMinutes;
    this.requiredTools = requiredTools;
    this.safetyNotes = safetyNotes;
    this.successRate = successRate;
    this.createdAt = createdAt;
  }

  static fromDatabase(row) {
    return new TroubleshootingProcedure({
      id: row.id,
      errorCodeId: row.error_code_id,
      stepNumber: row.step_number,
      title: row.title,
      instruction: row.instruction,
      estimatedTimeMinutes: row.estimated_time_minutes,
      requiredTools: row.required_tools || [],
      safetyNotes: row.safety_notes,
      successRate: parseFloat(row.success_rate) || 0.0,
      createdAt: row.created_at
    });
  }

  toJSON() {
    return {
      id: this.id,
      errorCodeId: this.errorCodeId,
      stepNumber: this.stepNumber,
      title: this.title,
      instruction: this.instruction,
      estimatedTimeMinutes: this.estimatedTimeMinutes,
      requiredTools: this.requiredTools,
      safetyNotes: this.safetyNotes,
      successRate: this.successRate,
      createdAt: this.createdAt
    };
  }
}

class ErrorResolution {
  constructor({
    id,
    errorCodeId,
    equipmentId,
    userId,
    resolutionTimeMinutes,
    successful = true,
    procedureStepsFollowed = [],
    notes,
    resolvedAt
  }) {
    this.id = id;
    this.errorCodeId = errorCodeId;
    this.equipmentId = equipmentId;
    this.userId = userId;
    this.resolutionTimeMinutes = resolutionTimeMinutes;
    this.successful = successful;
    this.procedureStepsFollowed = procedureStepsFollowed;
    this.notes = notes;
    this.resolvedAt = resolvedAt;
  }

  static fromDatabase(row) {
    return new ErrorResolution({
      id: row.id,
      errorCodeId: row.error_code_id,
      equipmentId: row.equipment_id,
      userId: row.user_id,
      resolutionTimeMinutes: row.resolution_time_minutes,
      successful: row.successful,
      procedureStepsFollowed: row.procedure_steps_followed || [],
      notes: row.notes,
      resolvedAt: row.resolved_at
    });
  }

  toJSON() {
    return {
      id: this.id,
      errorCodeId: this.errorCodeId,
      equipmentId: this.equipmentId,
      userId: this.userId,
      resolutionTimeMinutes: this.resolutionTimeMinutes,
      successful: this.successful,
      procedureStepsFollowed: this.procedureStepsFollowed,
      notes: this.notes,
      resolvedAt: this.resolvedAt
    };
  }
}

// Error code severity levels
export const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Error code categories
export const ERROR_CATEGORIES = {
  MECHANICAL: 'Mechanical',
  ELECTRICAL: 'Electrical',
  HYDRAULIC: 'Hydraulic',
  PNEUMATIC: 'Pneumatic',
  SENSOR: 'Sensor',
  COMMUNICATION: 'Communication',
  SOFTWARE: 'Software',
  SAFETY: 'Safety',
  THERMAL: 'Thermal',
  OPTICAL: 'Optical',
  CALIBRATION: 'Calibration',
  MAINTENANCE: 'Maintenance',
  LIGHTING: 'Lighting'
};

export {
  ErrorCode,
  TroubleshootingProcedure,
  ErrorResolution
};