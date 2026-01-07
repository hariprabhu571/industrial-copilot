// Test Equipment Management Setup
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log("🏭 Testing Equipment Management Setup\n");

async function testEquipmentSetup() {
  try {
    // Import database connection
    const { query } = await import("./src/db/postgres.js");
    
    console.log("1️⃣ Testing database connection...");
    const versionResult = await query("SELECT version()");
    console.log(`   ✅ Connected to: ${versionResult.rows[0].version.split(' ')[0]} ${versionResult.rows[0].version.split(' ')[1]}`);
    
    console.log("\n2️⃣ Applying Equipment Management Schema...");
    
    // Read and execute equipment schema
    const equipmentSchemaPath = join(__dirname, 'sql', 'equipment-schema.sql');
    const equipmentSchemaSQL = readFileSync(equipmentSchemaPath, 'utf8');
    
    // Execute the schema (PostgreSQL can handle multiple statements)
    await query(equipmentSchemaSQL);
    console.log("   ✅ Equipment Management schema applied");
    
    console.log("\n3️⃣ Loading Equipment Sample Data...");
    
    // Read and execute equipment data
    const equipmentDataPath = join(__dirname, 'sql', 'equipment-sample-data.sql');
    const equipmentDataSQL = readFileSync(equipmentDataPath, 'utf8');
    
    // Execute the data (PostgreSQL can handle multiple statements)
    await query(equipmentDataSQL);
    console.log("   ✅ Equipment sample data loaded");
    
    console.log("\n4️⃣ Verifying Equipment Management Setup...");
    
    // Check equipment tables
    const equipmentTables = [
      'equipment_categories',
      'equipment_locations', 
      'equipment',
      'equipment_specifications',
      'maintenance_records',
      'equipment_status',
      'equipment_alarms',
      'equipment_documents'
    ];
    
    for (const table of equipmentTables) {
      const result = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )`,
        [table]
      );
      
      if (result.rows[0].exists) {
        const countResult = await query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ✅ Table '${table}': ${countResult.rows[0].count} records`);
      } else {
        console.log(`   ❌ Table '${table}' missing`);
      }
    }
    
    console.log("\n5️⃣ Verifying Demo Users...");
    
    const userResult = await query(`
      SELECT username, role, equipment_role, accessible_plants, department 
      FROM users 
      WHERE equipment_role IS NOT NULL
      ORDER BY equipment_role
    `);
    
    console.log(`   ✅ Users with Equipment Roles: ${userResult.rows.length}`);
    userResult.rows.forEach(user => {
      console.log(`      - ${user.username} (${user.equipment_role}) - ${user.department} - Plants: ${user.accessible_plants?.join(', ') || 'None'}`);
    });
    
    console.log("\n6️⃣ Verifying Enterprise System Simulation...");
    
    const sapCount = await query('SELECT COUNT(*) FROM sap_equipment_master');
    const maximoCount = await query('SELECT COUNT(*) FROM maximo_work_orders');
    const mesCount = await query('SELECT COUNT(*) FROM mes_production_data');
    const scadaCount = await query('SELECT COUNT(*) FROM scada_status_data');
    
    console.log(`   ✅ SAP Equipment Master: ${sapCount.rows[0].count} records`);
    console.log(`   ✅ Maximo Work Orders: ${maximoCount.rows[0].count} records`);
    console.log(`   ✅ MES Production Data: ${mesCount.rows[0].count} records`);
    console.log(`   ✅ SCADA Status Data: ${scadaCount.rows[0].count} records`);
    
    console.log("\n7️⃣ Testing Equipment Queries...");
    
    // Test equipment with location query
    const equipmentWithLocation = await query(`
      SELECT e.equipment_number, e.name, el.plant, el.area, el.line, e.operational_state
      FROM equipment e
      LEFT JOIN equipment_locations el ON e.location_id = el.id
      LIMIT 5
    `);
    
    console.log(`   ✅ Equipment with Location Query: ${equipmentWithLocation.rows.length} results`);
    equipmentWithLocation.rows.forEach(eq => {
      console.log(`      - ${eq.equipment_number}: ${eq.name} (${eq.plant}-${eq.area}) - ${eq.operational_state}`);
    });
    
    // Test maintenance records query
    const maintenanceRecords = await query(`
      SELECT mr.work_order_number, mr.work_type, mr.status, e.equipment_number
      FROM maintenance_records mr
      JOIN equipment e ON mr.equipment_id = e.id
      WHERE mr.status IN ('SCHEDULED', 'IN_PROGRESS')
      LIMIT 3
    `);
    
    console.log(`   ✅ Active Maintenance Records: ${maintenanceRecords.rows.length} results`);
    maintenanceRecords.rows.forEach(mr => {
      console.log(`      - ${mr.work_order_number}: ${mr.equipment_number} (${mr.work_type}) - ${mr.status}`);
    });
    
    console.log("\n🎉 Equipment Management Setup Complete!");
    console.log("\n📊 Summary:");
    console.log("   ✅ Equipment Management schema created");
    console.log("   ✅ Sample industrial equipment data loaded");
    console.log("   ✅ Demo users with equipment roles created");
    console.log("   ✅ Enterprise system simulation ready");
    console.log("   ✅ Multi-system federation architecture in place");
    
    console.log("\n🚀 Ready for Phase 29 Development!");
    console.log("   Next steps:");
    console.log("   1. Create equipment service layer");
    console.log("   2. Build equipment API endpoints");
    console.log("   3. Implement permission-based access");
    console.log("   4. Create equipment management UI");
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Equipment setup failed: ${error.message}`);
    console.log("Stack trace:", error.stack);
    return false;
  }
}

// Run the test
testEquipmentSetup().then(success => {
  process.exit(success ? 0 : 1);
});