// Equipment Management Data Models
// Phase 29: Industrial AI Copilot - Equipment Data Models

/**
 * Equipment Category Model
 */
class EquipmentCategory {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.parentCategoryId = data.parent_category_id;
    this.createdAt = data.created_at;
  }
}

/**
 * Equipment Location Model
 */
class EquipmentLocation {
  constructor(data) {
    this.id = data.id;
    this.plant = data.plant;
    this.area = data.area;
    this.line = data.line;
    this.station = data.station;
    this.functionalLocation = data.functional_location;
    this.description = data.description;
    this.coordinates = {
      lat: data.coordinates_lat,
      lng: data.coordinates_lng
    };
    this.createdAt = data.created_at;
  }
}

/**
 * Equipment Specification Model
 */
class EquipmentSpecification {
  constructor(data) {
    this.id = data.id;
    this.equipmentId = data.equipment_id;
    this.specType = data.spec_type; // 'TECHNICAL', 'OPERATING', 'SAFETY', 'PERFORMANCE'
    this.specName = data.spec_name;
    this.specValue = data.spec_value;
    this.unit = data.unit;
    this.minValue = data.min_value;
    this.maxValue = data.max_value;
    this.createdAt = data.created_at;
  }
}

/**
 * Equipment Model (Main Equipment Entity)
 */
class Equipment {
  constructor(data) {
    this.id = data.id;
    this.equipmentNumber = data.equipment_number;
    this.name = data.name;
    this.description = data.description;
    this.categoryId = data.category_id;
    this.locationId = data.location_id;
    this.manufacturer = data.manufacturer;
    this.model = data.model;
    this.serialNumber = data.serial_number;
    this.installationDate = data.installation_date;
    this.commissioningDate = data.commissioning_date;
    this.warrantyExpiry = data.warranty_expiry;
    this.criticality = data.criticality; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    this.operationalState = data.operational_state; // 'OPERATIONAL', 'MAINTENANCE', 'OFFLINE', 'ALARM', 'DECOMMISSIONED'
    this.statusUpdatedAt = data.status_updated_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    
    // Related data (populated when joined)
    this.category = data.category_name ? {
      name: data.category_name,
      description: data.category_description
    } : null;
    
    this.location = data.plant ? {
      plant: data.plant,
      area: data.area,
      line: data.line,
      station: data.station,
      functionalLocation: data.functional_location
    } : null;
    
    this.specifications = [];
    this.status = null;
    this.alarms = [];
    this.documents = [];
  }
  
  /**
   * Add specification to equipment
   */
  addSpecification(spec) {
    this.specifications.push(new EquipmentSpecification(spec));
  }
  
  /**
   * Get specifications by type
   */
  getSpecificationsByType(type) {
    return this.specifications.filter(spec => spec.specType === type);
  }
  
  /**
   * Check if equipment is operational
   */
  isOperational() {
    return this.operationalState === 'OPERATIONAL';
  }
  
  /**
   * Check if equipment is critical
   */
  isCritical() {
    return this.criticality === 'CRITICAL';
  }
}

/**
 * Equipment Status Model
 */
class EquipmentStatus {
  constructor(data) {
    this.id = data.id;
    this.equipmentId = data.equipment_id;
    this.statusTimestamp = data.status_timestamp;
    this.operationalState = data.operational_state;
    this.availabilityPercentage = data.availability_percentage;
    this.reliabilityPercentage = data.reliability_percentage;
    this.efficiencyPercentage = data.efficiency_percentage;
    this.performanceData = data.performance_data;
    this.alarmCount = data.alarm_count;
    this.warningCount = data.warning_count;
    this.lastMaintenanceDate = data.last_maintenance_date;
    this.nextMaintenanceDate = data.next_maintenance_date;
    this.runtimeHours = data.runtime_hours;
    this.cycleCount = data.cycle_count;
    this.createdAt = data.created_at;
  }
  
  /**
   * Calculate Overall Equipment Effectiveness (OEE)
   */
  calculateOEE() {
    if (!this.availabilityPercentage || !this.reliabilityPercentage || !this.efficiencyPercentage) {
      return null;
    }
    return (this.availabilityPercentage * this.reliabilityPercentage * this.efficiencyPercentage) / 10000;
  }
  
  /**
   * Check if maintenance is due
   */
  isMaintenanceDue() {
    if (!this.nextMaintenanceDate) return false;
    return new Date(this.nextMaintenanceDate) <= new Date();
  }
}

/**
 * Equipment Alarm Model
 */
class EquipmentAlarm {
  constructor(data) {
    this.id = data.id;
    this.equipmentId = data.equipment_id;
    this.alarmCode = data.alarm_code;
    this.alarmType = data.alarm_type; // 'CRITICAL', 'WARNING', 'INFO'
    this.severity = data.severity; // 1-10
    this.description = data.description;
    this.triggeredAt = data.triggered_at;
    this.acknowledgedAt = data.acknowledged_at;
    this.acknowledgedBy = data.acknowledged_by;
    this.resolvedAt = data.resolved_at;
    this.resolvedBy = data.resolved_by;
    this.resolutionNotes = data.resolution_notes;
    this.status = data.status; // 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED'
    this.createdAt = data.created_at;
  }
  
  /**
   * Check if alarm is active
   */
  isActive() {
    return this.status === 'ACTIVE';
  }
  
  /**
   * Check if alarm is critical
   */
  isCritical() {
    return this.alarmType === 'CRITICAL';
  }
}

/**
 * Maintenance Record Model
 */
class MaintenanceRecord {
  constructor(data) {
    this.id = data.id;
    this.equipmentId = data.equipment_id;
    this.workOrderNumber = data.work_order_number;
    this.workType = data.work_type; // 'PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'EMERGENCY', 'INSPECTION'
    this.priority = data.priority; // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    this.status = data.status; // 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'
    this.description = data.description;
    this.scheduledDate = data.scheduled_date;
    this.startedDate = data.started_date;
    this.completedDate = data.completed_date;
    this.estimatedDuration = data.estimated_duration;
    this.actualDuration = data.actual_duration;
    this.technicianAssigned = data.technician_assigned;
    this.technicianCompleted = data.technician_completed;
    this.laborHours = data.labor_hours;
    this.materialCost = data.material_cost;
    this.laborCost = data.labor_cost;
    this.totalCost = data.total_cost;
    this.notes = data.notes;
    this.failureCode = data.failure_code;
    this.rootCause = data.root_cause;
    this.correctiveAction = data.corrective_action;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    
    // Related equipment data (when joined)
    this.equipmentNumber = data.equipment_number;
    this.equipmentName = data.equipment_name;
  }
  
  /**
   * Check if maintenance is completed
   */
  isCompleted() {
    return this.status === 'COMPLETED';
  }
  
  /**
   * Check if maintenance is overdue
   */
  isOverdue() {
    if (this.status === 'COMPLETED' || !this.scheduledDate) return false;
    return new Date(this.scheduledDate) < new Date();
  }
  
  /**
   * Calculate duration in hours
   */
  getDurationHours() {
    if (this.actualDuration) {
      return this.actualDuration / 60; // Convert minutes to hours
    }
    if (this.estimatedDuration) {
      return this.estimatedDuration / 60;
    }
    return null;
  }
}

/**
 * Equipment Search Criteria Model
 */
class EquipmentSearchCriteria {
  constructor(params = {}) {
    this.equipmentNumber = params.equipmentNumber;
    this.name = params.name;
    this.manufacturer = params.manufacturer;
    this.model = params.model;
    this.category = params.category;
    this.plant = params.plant;
    this.area = params.area;
    this.line = params.line;
    this.operationalState = params.operationalState;
    this.criticality = params.criticality;
    this.hasAlarms = params.hasAlarms;
    this.maintenanceDue = params.maintenanceDue;
    
    // Pagination
    this.page = parseInt(params.page) || 1;
    this.limit = parseInt(params.limit) || 20;
    this.offset = (this.page - 1) * this.limit;
    
    // Sorting
    this.sortBy = params.sortBy || 'equipment_number';
    this.sortOrder = params.sortOrder === 'desc' ? 'DESC' : 'ASC';
  }
  
  /**
   * Build WHERE clause for SQL query
   */
  buildWhereClause() {
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (this.equipmentNumber) {
      conditions.push(`e.equipment_number ILIKE $${paramIndex}`);
      values.push(`%${this.equipmentNumber}%`);
      paramIndex++;
    }
    
    if (this.name) {
      conditions.push(`e.name ILIKE $${paramIndex}`);
      values.push(`%${this.name}%`);
      paramIndex++;
    }
    
    if (this.manufacturer) {
      conditions.push(`e.manufacturer ILIKE $${paramIndex}`);
      values.push(`%${this.manufacturer}%`);
      paramIndex++;
    }
    
    if (this.model) {
      conditions.push(`e.model ILIKE $${paramIndex}`);
      values.push(`%${this.model}%`);
      paramIndex++;
    }
    
    if (this.category) {
      conditions.push(`ec.name ILIKE $${paramIndex}`);
      values.push(`%${this.category}%`);
      paramIndex++;
    }
    
    if (this.plant) {
      conditions.push(`el.plant = $${paramIndex}`);
      values.push(this.plant);
      paramIndex++;
    }
    
    if (this.area) {
      conditions.push(`el.area = $${paramIndex}`);
      values.push(this.area);
      paramIndex++;
    }
    
    if (this.line) {
      conditions.push(`el.line = $${paramIndex}`);
      values.push(this.line);
      paramIndex++;
    }
    
    if (this.operationalState) {
      conditions.push(`e.operational_state = $${paramIndex}`);
      values.push(this.operationalState);
      paramIndex++;
    }
    
    if (this.criticality) {
      conditions.push(`e.criticality = $${paramIndex}`);
      values.push(this.criticality);
      paramIndex++;
    }
    
    return {
      whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values,
      paramIndex
    };
  }
}

/**
 * User Equipment Permissions Model
 */
class UserEquipmentPermissions {
  constructor(data) {
    this.userId = data.user_id;
    this.role = data.role;
    this.equipmentRole = data.equipment_role;
    this.accessiblePlants = data.accessible_plants || [];
    this.accessibleAreas = data.accessible_areas || [];
    this.accessibleLines = data.accessible_lines || [];
    this.assignedEquipment = data.assigned_equipment || [];
    this.department = data.department;
  }
  
  /**
   * Check if user can access specific equipment
   */
  canAccessEquipment(equipment) {
    // Admin can access everything
    if (this.role === 'admin') return true;
    
    // Check plant access
    if (this.accessiblePlants.length > 0 && equipment.location) {
      if (!this.accessiblePlants.includes(equipment.location.plant)) {
        return false;
      }
    }
    
    // Check area access
    if (this.accessibleAreas.length > 0 && equipment.location) {
      if (!this.accessibleAreas.includes(equipment.location.area)) {
        return false;
      }
    }
    
    // Check line access
    if (this.accessibleLines.length > 0 && equipment.location) {
      if (equipment.location.line && !this.accessibleLines.includes(equipment.location.line)) {
        return false;
      }
    }
    
    // Check assigned equipment (for technicians)
    if (this.equipmentRole === 'technician' && this.assignedEquipment.length > 0) {
      return this.assignedEquipment.includes(equipment.equipmentNumber);
    }
    
    return true;
  }
  
  /**
   * Check if user can view maintenance data
   */
  canViewMaintenance() {
    return ['admin', 'plant_manager', 'maintenance_supervisor', 'technician'].includes(this.equipmentRole);
  }
  
  /**
   * Check if user can view technical specifications
   */
  canViewTechnicalSpecs() {
    return ['admin', 'plant_manager', 'maintenance_supervisor', 'technician'].includes(this.equipmentRole);
  }
  
  /**
   * Check if user can view cost data
   */
  canViewCostData() {
    return ['admin', 'plant_manager'].includes(this.equipmentRole);
  }
}

// Export all models
export {
  EquipmentCategory,
  EquipmentLocation,
  EquipmentSpecification,
  Equipment,
  EquipmentStatus,
  EquipmentAlarm,
  MaintenanceRecord,
  EquipmentSearchCriteria,
  UserEquipmentPermissions
};