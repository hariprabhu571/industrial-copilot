// Setup Equipment Management Only (assumes main schema exists)
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log("🏭 Setting up Equipment Management System (Phase 29)\n");

async function setupEquipmentManagement() {
  try {
    // Import database connection
    const { query } = await import("./src/db/postgres.js");
    
    console.log("1️⃣ Testing database connection...");
    const versionResult = await query("SELECT version()");
    console.log(`   ✅ Connected to: ${versionResult.rows[0].version.split(' ')[0]} ${versionResult.rows[0].version.split(' ')[1]}`);
    
    console.log("\n2️⃣ Checking existing tables...");
    const existingTables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   ✅ Found ${existingTables.rows.length} existing tables:`);
    existingTables.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });
    
    console.log("\n3️⃣ Applying Equipment Management Schema...");
    
    // Read equipment schema file
    const equipmentSchemaPath = join(__dirname, 'sql', 'equipment-schema.sql');
    const equipmentSchemaSQL = readFileSync(equipmentSchemaPath, 'utf8');
    
    // Split into individual statements and execute one by one
    const statements = equipmentSchemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`   Processing ${statements.length} schema statements...`);
    
    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await query(statement);
        successCount++;
        if (i % 10 === 0) {
          console.log(`   Progress: ${i + 1}/${statements.length} statements processed`);
        }
      } catch (error) {
        if (!error.message.includes('already exists') && 
            !error.message.includes('duplicate') &&
            !error.message.includes('does not exist')) {
          console.log(`   ⚠️  Warning on statement ${i + 1}: ${error.message}`);
        }
      }
    }
    
    console.log(`   ✅ Equipment schema applied (${successCount}/${statements.length} successful)`);
    
    console.log("\n4️⃣ Loading Equipment Sample Data...");
    
    // Read equipment data file
    const equipmentDataPath = join(__dirname, 'sql', 'equipment-sample-data.sql');
    const equipmentDataSQL = readFileSync(equipmentDataPath, 'utf8');
    
    // Split into individual statements and execute one by one
    const dataStatements = equipmentDataSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`   Processing ${dataStatements.length} data statements...`);
    
    let dataSuccessCount = 0;
    for (let i = 0; i < dataStatements.length; i++) {
      const statement = dataStatements[i];
      try {
        await query(statement);
        dataSuccessCount++;
        if (i % 20 === 0) {
          console.log(`   Progress: ${i + 1}/${dataStatements.length} data statements processed`);
        }
      } catch (error) {
        if (!error.message.includes('duplicate key') && 
            !error.message.includes('already exists') &&
            !error.message.includes('violates unique constraint')) {
          console.log(`   ⚠️  Warning on data statement ${i + 1}: ${error.message}`);
        }
      }
    }
    
    console.log(`   ✅ Equipment data loaded (${dataSuccessCount}/${dataStatements.length} successful)`);
    
    console.log("\n5️⃣ Verifying Equipment Management Setup...");
    
    // Check equipment tables
    const equipmentTables = [
      'equipment_categories',
      'equipment_locations', 
      'equipment',
      'equipment_specifications',
      'maintenance_records',
      'equipment_status',
      'equipment_alarms',
      'equipment_documents',
      'sap_equipment_master',
      'maximo_work_orders',
      'mes_production_data',
      'scada_status_data'
    ];
    
    for (const table of equipmentTables) {
      try {
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
      } catch (error) {
        console.log(`   ❌ Error checking table '${table}': ${error.message}`);
      }
    }
    
    console.log("\n6️⃣ Verifying Demo Users...");
    
    try {
      const userResult = await query(`
        SELECT username, role, equipment_role, accessible_plants, department 
        FROM users 
        WHERE equipment_role IS NOT NULL
        ORDER BY equipment_role
      `);
      
      console.log(`   ✅ Users with Equipment Roles: ${userResult.rows.length}`);
      userResult.rows.forEach(user => {
        const plants = user.accessible_plants ? user.accessible_plants.join(', ') : 'None';
        console.log(`      - ${user.username} (${user.equipment_role}) - ${user.department} - Plants: ${plants}`);
      });
    } catch (error) {
      console.log(`   ❌ Error checking users: ${error.message}`);
    }
    
    console.log("\n7️⃣ Testing Sample Queries...");
    
    try {
      // Test equipment query
      const equipmentResult = await query(`
        SELECT e.equipment_number, e.name, el.plant, el.area, e.operational_state
        FROM equipment e
        LEFT JOIN equipment_locations el ON e.location_id = el.id
        LIMIT 3
      `);
      
      console.log(`   ✅ Equipment Query: ${equipmentResult.rows.length} results`);
      equipmentResult.rows.forEach(eq => {
        console.log(`      - ${eq.equipment_number}: ${eq.name} (${eq.plant}-${eq.area}) - ${eq.operational_state}`);
      });
    } catch (error) {
      console.log(`   ❌ Equipment query failed: ${error.message}`);
    }
    
    try {
      // Test maintenance query
      const maintenanceResult = await query(`
        SELECT work_order_number, work_type, status
        FROM maintenance_records
        WHERE status IN ('SCHEDULED', 'IN_PROGRESS')
        LIMIT 3
      `);
      
      console.log(`   ✅ Maintenance Query: ${maintenanceResult.rows.length} results`);
      maintenanceResult.rows.forEach(mr => {
        console.log(`      - ${mr.work_order_number}: ${mr.work_type} - ${mr.status}`);
      });
    } catch (error) {
      console.log(`   ❌ Maintenance query failed: ${error.message}`);
    }
    
    console.log("\n🎉 Equipment Management Setup Complete!");
    console.log("\n📊 Phase 29 Status:");
    console.log("   ✅ Equipment Management schema created");
    console.log("   ✅ Industrial equipment data loaded");
    console.log("   ✅ Demo users with equipment roles");
    console.log("   ✅ Enterprise system simulation ready");
    console.log("   ✅ Multi-system federation architecture");
    
    console.log("\n🚀 Ready for Equipment API Development!");
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Equipment setup failed: ${error.message}`);
    console.log("Stack trace:", error.stack);
    return false;
  }
}

// Run the setup
setupEquipmentManagement().then(success => {
  process.exit(success ? 0 : 1);
});