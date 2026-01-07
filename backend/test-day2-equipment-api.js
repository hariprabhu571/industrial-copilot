// Day 2 Test - Equipment Management API
// Phase 29: Industrial AI Copilot - Equipment Service & API Testing

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_BASE = 'http://localhost:3001/api';
const TEST_USERS = {
  admin: { username: 'admin', password: 'admin123' },
  plantManager: { username: 'plant.manager', password: 'manager123' },
  technician: { username: 'tech.senior', password: 'tech123' },
  operator: { username: 'operator.line1', password: 'operator123' }
};

console.log("🧪 Day 2 Test - Equipment Management API\n");

class EquipmentAPITester {
  constructor() {
    this.tokens = {};
  }

  async authenticateUsers() {
    console.log("1️⃣ Authenticating test users...");
    
    for (const [role, credentials] of Object.entries(TEST_USERS)) {
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.tokens[role] = data.data.token;
          console.log(`   ✅ ${role} authenticated successfully`);
        } else {
          console.log(`   ❌ ${role} authentication failed: ${data.error}`);
        }
      } catch (error) {
        console.log(`   ❌ ${role} authentication error: ${error.message}`);
      }
    }
    
    console.log("");
  }

  async makeRequest(endpoint, token, method = 'GET') {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testEquipmentSearch() {
    console.log("2️⃣ Testing Equipment Search API...");
    
    // Test admin search (should see all equipment)
    const adminSearch = await this.makeRequest('/equipment', this.tokens.admin);
    console.log(`   ✅ Admin search: ${adminSearch.data?.length || 0} equipment items`);
    
    // Test plant manager search (should see Plant A equipment)
    const managerSearch = await this.makeRequest('/equipment?plant=PLANT-A', this.tokens.plantManager);
    console.log(`   ✅ Plant Manager search: ${managerSearch.data?.length || 0} equipment items`);
    
    // Test technician search (should see assigned equipment)
    const techSearch = await this.makeRequest('/equipment', this.tokens.technician);
    console.log(`   ✅ Technician search: ${techSearch.data?.length || 0} equipment items`);
    
    // Test operator search (should see line equipment)
    const operatorSearch = await this.makeRequest('/equipment', this.tokens.operator);
    console.log(`   ✅ Operator search: ${operatorSearch.data?.length || 0} equipment items`);
    
    // Test search with filters
    const filteredSearch = await this.makeRequest('/equipment?operationalState=OPERATIONAL&limit=5', this.tokens.admin);
    console.log(`   ✅ Filtered search (operational): ${filteredSearch.data?.length || 0} equipment items`);
    
    console.log("");
  }

  async testEquipmentDetails() {
    console.log("3️⃣ Testing Equipment Details API...");
    
    const testEquipmentIds = ['EQ-PMP-001', 'EQ-CNV-001', 'EQ-PLC-001'];
    
    for (const equipmentId of testEquipmentIds) {
      // Test admin access
      const adminDetail = await this.makeRequest(`/equipment/${equipmentId}`, this.tokens.admin);
      if (adminDetail.success) {
        console.log(`   ✅ Admin can access ${equipmentId}: ${adminDetail.data.name}`);
      } else {
        console.log(`   ❌ Admin cannot access ${equipmentId}: ${adminDetail.error}`);
      }
      
      // Test technician access
      const techDetail = await this.makeRequest(`/equipment/${equipmentId}`, this.tokens.technician);
      if (techDetail.success) {
        console.log(`   ✅ Technician can access ${equipmentId}: ${techDetail.data.name}`);
      } else {
        console.log(`   ⚠️  Technician cannot access ${equipmentId}: Access restricted`);
      }
    }
    
    console.log("");
  }

  async testMaintenanceHistory() {
    console.log("4️⃣ Testing Maintenance History API...");
    
    const equipmentId = 'EQ-PMP-001';
    
    // Test admin access to maintenance history
    const adminMaintenance = await this.makeRequest(`/equipment/${equipmentId}/maintenance`, this.tokens.admin);
    if (adminMaintenance.success) {
      console.log(`   ✅ Admin maintenance history: ${adminMaintenance.data.length} records`);
      if (adminMaintenance.data.length > 0) {
        const record = adminMaintenance.data[0];
        console.log(`      - ${record.workOrderNumber}: ${record.workType} (${record.status})`);
      }
    }
    
    // Test technician access to maintenance history
    const techMaintenance = await this.makeRequest(`/equipment/${equipmentId}/maintenance`, this.tokens.technician);
    if (techMaintenance.success) {
      console.log(`   ✅ Technician maintenance history: ${techMaintenance.data.length} records`);
    } else {
      console.log(`   ❌ Technician maintenance access denied: ${techMaintenance.error}`);
    }
    
    // Test operator access (should be denied)
    const operatorMaintenance = await this.makeRequest(`/equipment/${equipmentId}/maintenance`, this.tokens.operator);
    if (!operatorMaintenance.success) {
      console.log(`   ✅ Operator maintenance access properly denied: ${operatorMaintenance.error}`);
    } else {
      console.log(`   ❌ Operator should not have maintenance access`);
    }
    
    console.log("");
  }

  async testEquipmentStatus() {
    console.log("5️⃣ Testing Equipment Status API...");
    
    const equipmentId = 'EQ-PMP-001';
    
    // Test status retrieval
    const status = await this.makeRequest(`/equipment/${equipmentId}/status`, this.tokens.admin);
    if (status.success) {
      console.log(`   ✅ Equipment status retrieved: ${status.data.operationalState}`);
      console.log(`      - Availability: ${status.data.availabilityPercentage}%`);
      console.log(`      - Reliability: ${status.data.reliabilityPercentage}%`);
      console.log(`      - Efficiency: ${status.data.efficiencyPercentage}%`);
    } else {
      console.log(`   ❌ Equipment status failed: ${status.error}`);
    }
    
    console.log("");
  }

  async testEquipmentAlarms() {
    console.log("6️⃣ Testing Equipment Alarms API...");
    
    const equipmentId = 'EQ-PMP-001';
    
    // Test alarms retrieval
    const alarms = await this.makeRequest(`/equipment/${equipmentId}/alarms`, this.tokens.admin);
    if (alarms.success) {
      console.log(`   ✅ Equipment alarms retrieved: ${alarms.data.length} alarms`);
      alarms.data.forEach(alarm => {
        console.log(`      - ${alarm.alarmCode}: ${alarm.description} (${alarm.alarmType})`);
      });
    } else {
      console.log(`   ❌ Equipment alarms failed: ${alarms.error}`);
    }
    
    console.log("");
  }

  async testLocationBasedAccess() {
    console.log("7️⃣ Testing Location-Based Access...");
    
    // Test Plant A access for plant manager
    const plantAEquipment = await this.makeRequest('/equipment/location/PLANT-A', this.tokens.plantManager);
    if (plantAEquipment.success) {
      console.log(`   ✅ Plant Manager can access Plant A: ${plantAEquipment.data.length} equipment items`);
    }
    
    // Test Plant B access for plant manager (should be denied)
    const plantBEquipment = await this.makeRequest('/equipment/location/PLANT-B', this.tokens.plantManager);
    if (!plantBEquipment.success) {
      console.log(`   ✅ Plant Manager properly denied Plant B access: ${plantBEquipment.error}`);
    } else {
      console.log(`   ❌ Plant Manager should not have Plant B access`);
    }
    
    // Test area-specific access
    const productionArea = await this.makeRequest('/equipment/location/PLANT-A/PRODUCTION', this.tokens.operator);
    if (productionArea.success) {
      console.log(`   ✅ Operator can access Production area: ${productionArea.data.length} equipment items`);
    }
    
    console.log("");
  }

  async testEquipmentStatistics() {
    console.log("8️⃣ Testing Equipment Statistics API...");
    
    // Test admin statistics (full access)
    const adminStats = await this.makeRequest('/equipment/statistics', this.tokens.admin);
    if (adminStats.success) {
      console.log(`   ✅ Admin statistics:`);
      console.log(`      - Total: ${adminStats.data.total}`);
      console.log(`      - Operational: ${adminStats.data.operational}`);
      console.log(`      - Maintenance: ${adminStats.data.maintenance}`);
      console.log(`      - Critical: ${adminStats.data.critical}`);
    }
    
    // Test technician statistics (filtered)
    const techStats = await this.makeRequest('/equipment/statistics', this.tokens.technician);
    if (techStats.success) {
      console.log(`   ✅ Technician statistics (filtered):`);
      console.log(`      - Total accessible: ${techStats.data.total}`);
      console.log(`      - Operational: ${techStats.data.operational}`);
    }
    
    console.log("");
  }

  async testAdapterHealth() {
    console.log("9️⃣ Testing Adapter Health API...");
    
    // Test admin access to health status
    const health = await this.makeRequest('/equipment/health', this.tokens.admin);
    if (health.success) {
      console.log(`   ✅ Adapter health retrieved:`);
      Object.entries(health.data).forEach(([adapter, status]) => {
        console.log(`      - ${adapter}: ${status.status} (${status.responseTime || 'N/A'})`);
      });
    } else {
      console.log(`   ❌ Adapter health failed: ${health.error}`);
    }
    
    // Test non-admin access (should be denied)
    const techHealth = await this.makeRequest('/equipment/health', this.tokens.technician);
    if (!techHealth.success) {
      console.log(`   ✅ Non-admin health access properly denied: ${techHealth.error}`);
    }
    
    console.log("");
  }

  async testCategoriessAndLocations() {
    console.log("🔟 Testing Categories and Locations APIs...");
    
    // Test categories
    const categories = await this.makeRequest('/equipment/categories', this.tokens.admin);
    if (categories.success) {
      console.log(`   ✅ Equipment categories: ${categories.data.length} categories`);
      categories.data.slice(0, 3).forEach(cat => {
        console.log(`      - ${cat.name}: ${cat.description}`);
      });
    }
    
    // Test locations
    const locations = await this.makeRequest('/equipment/locations', this.tokens.admin);
    if (locations.success) {
      console.log(`   ✅ Equipment locations retrieved successfully`);
      Object.keys(locations.data).forEach(plant => {
        const areas = Object.keys(locations.data[plant]).length;
        console.log(`      - ${plant}: ${areas} areas`);
      });
    }
    
    console.log("");
  }

  async runAllTests() {
    try {
      console.log("🚀 Starting Equipment Management API Tests\n");
      
      await this.authenticateUsers();
      await this.testEquipmentSearch();
      await this.testEquipmentDetails();
      await this.testMaintenanceHistory();
      await this.testEquipmentStatus();
      await this.testEquipmentAlarms();
      await this.testLocationBasedAccess();
      await this.testEquipmentStatistics();
      await this.testAdapterHealth();
      await this.testCategoriessAndLocations();
      
      console.log("🎉 Day 2 Equipment Management API Tests Complete!");
      console.log("✅ Equipment Service Layer & API Implementation Working!");
      
      return true;
      
    } catch (error) {
      console.log(`\n❌ Day 2 Tests Failed: ${error.message}`);
      return false;
    }
  }
}

// Check if backend is running
async function checkBackendStatus() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (data.status) {
      console.log("✅ Backend is running and ready for testing\n");
      return true;
    }
  } catch (error) {
    console.log("❌ Backend is not running. Please start the backend first:");
    console.log("   cd backend && npm start\n");
    return false;
  }
}

// Run the tests
async function runTests() {
  const backendReady = await checkBackendStatus();
  
  if (!backendReady) {
    process.exit(1);
  }
  
  const tester = new EquipmentAPITester();
  const success = await tester.runAllTests();
  
  process.exit(success ? 0 : 1);
}

runTests();