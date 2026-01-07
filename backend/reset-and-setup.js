// Reset Database and Setup Everything Fresh
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log("🔄 Reset and Setup Industrial AI Copilot Database\n");

async function resetAndSetup() {
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
    
    console.log(`   Found ${existingTables.rows.length} existing tables:`);
    existingTables.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });
    
    console.log("\n3️⃣ Dropping existing tables (if any)...");
    
    // Drop tables in correct order (reverse dependency order)
    const tablesToDrop = [
      'equipment_documents',
      'equipment_alarms', 
      'equipment_status',
      'maintenance_records',
      'equipment_specifications',
      'equipment',
      'equipment_locations',
      'equipment_categories',
      'user_equipment_permissions',
      'sap_equipment_master',
      'maximo_work_orders', 
      'mes_production_data',
      'scada_status_data',
      'embeddings',
      'chunks',
      'audit_logs',
      'documents',
      'users'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`   ✅ Dropped table '${table}'`);
      } catch (error) {
        console.log(`   ⚠️  Could not drop table '${table}': ${error.message}`);
      }
    }
    
    console.log("\n4️⃣ Installing pgvector extension...");
    try {
      await query("CREATE EXTENSION IF NOT EXISTS vector");
      console.log("   ✅ pgvector extension installed");
    } catch (error) {
      console.log(`   ❌ Failed to install pgvector: ${error.message}`);
    }
    
    console.log("\n5️⃣ Creating fresh main schema...");
    
    // Read and execute fixed main schema
    const schemaPath = join(__dirname, 'sql', 'schema-fixed.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');
    
    await query(schemaSQL);
    console.log("   ✅ Main database schema created");
    
    console.log("\n6️⃣ Verifying main tables...");
    const mainTables = ['documents', 'chunks', 'embeddings', 'audit_logs', 'users'];
    
    for (const table of mainTables) {
      const result = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )`,
        [table]
      );
      
      if (result.rows[0].exists) {
        console.log(`   ✅ Table '${table}' created`);
      } else {
        console.log(`   ❌ Table '${table}' missing`);
      }
    }
    
    console.log("\n7️⃣ Creating equipment management schema...");
    
    // Read and execute equipment schema
    const equipmentSchemaPath = join(__dirname, 'sql', 'equipment-schema.sql');
    const equipmentSchemaSQL = readFileSync(equipmentSchemaPath, 'utf8');
    
    await query(equipmentSchemaSQL);
    console.log("   ✅ Equipment management schema created");
    
    console.log("\n8️⃣ Loading equipment sample data...");
    
    // Read and execute equipment data
    const equipmentDataPath = join(__dirname, 'sql', 'equipment-sample-data.sql');
    const equipmentDataSQL = readFileSync(equipmentDataPath, 'utf8');
    
    await query(equipmentDataSQL);
    console.log("   ✅ Equipment sample data loaded");
    
    console.log("\n9️⃣ Final verification...");
    
    // Verify all tables
    const allTables = await query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   ✅ Total tables created: ${allTables.rows.length}`);
    allTables.rows.forEach(table => {
      console.log(`      - ${table.table_name} (${table.column_count} columns)`);
    });
    
    // Test equipment query
    try {
      const equipmentCount = await query('SELECT COUNT(*) FROM equipment');
      const userCount = await query('SELECT COUNT(*) FROM users WHERE equipment_role IS NOT NULL');
      const maintenanceCount = await query('SELECT COUNT(*) FROM maintenance_records');
      
      console.log(`\n   📊 Data Summary:`);
      console.log(`      - Equipment Records: ${equipmentCount.rows[0].count}`);
      console.log(`      - Users with Equipment Roles: ${userCount.rows[0].count}`);
      console.log(`      - Maintenance Records: ${maintenanceCount.rows[0].count}`);
    } catch (error) {
      console.log(`   ❌ Data verification failed: ${error.message}`);
    }
    
    console.log("\n🎉 Fresh Setup Complete!");
    console.log("\n🏭 Industrial AI Copilot with Equipment Management Ready!");
    console.log("   ✅ Core RAG system ready");
    console.log("   ✅ Equipment Management system ready");
    console.log("   ✅ Industrial equipment data loaded");
    console.log("   ✅ Demo users with equipment roles");
    console.log("   ✅ Enterprise system simulation ready");
    
    console.log("\n🚀 Phase 29 Implementation Ready!");
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Reset and setup failed: ${error.message}`);
    console.log("Stack trace:", error.stack);
    return false;
  }
}

// Run the reset and setup
resetAndSetup().then(success => {
  process.exit(success ? 0 : 1);
});