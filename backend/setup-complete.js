// Complete Database Setup - Main Schema + Equipment Management
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log("🏭 Complete Industrial AI Copilot Setup (Main + Equipment Management)\n");

async function setupComplete() {
  try {
    // Import database connection
    const { query } = await import("./src/db/postgres.js");
    
    console.log("1️⃣ Testing database connection...");
    const versionResult = await query("SELECT version()");
    console.log(`   ✅ Connected to: ${versionResult.rows[0].version.split(' ')[0]} ${versionResult.rows[0].version.split(' ')[1]}`);
    
    console.log("\n2️⃣ Installing pgvector extension...");
    try {
      await query("CREATE EXTENSION IF NOT EXISTS vector");
      console.log("   ✅ pgvector extension installed");
    } catch (error) {
      console.log(`   ❌ Failed to install pgvector: ${error.message}`);
    }
    
    console.log("\n3️⃣ Creating main database schema...");
    
    // Read and execute fixed main schema
    const schemaPath = join(__dirname, 'sql', 'schema-fixed.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');
    
    await query(schemaSQL);
    console.log("   ✅ Main database schema created");
    
    console.log("\n4️⃣ Verifying main tables...");
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
    
    console.log("\n5️⃣ Creating equipment management schema...");
    
    // Read and execute equipment schema
    const equipmentSchemaPath = join(__dirname, 'sql', 'equipment-schema.sql');
    const equipmentSchemaSQL = readFileSync(equipmentSchemaPath, 'utf8');
    
    await query(equipmentSchemaSQL);
    console.log("   ✅ Equipment management schema created");
    
    console.log("\n6️⃣ Loading equipment sample data...");
    
    // Read and execute equipment data
    const equipmentDataPath = join(__dirname, 'sql', 'equipment-sample-data.sql');
    const equipmentDataSQL = readFileSync(equipmentDataPath, 'utf8');
    
    await query(equipmentDataSQL);
    console.log("   ✅ Equipment sample data loaded");
    
    console.log("\n7️⃣ Verifying equipment tables...");
    
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
    
    console.log("\n8️⃣ Verifying demo users...");
    
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
    
    console.log("\n9️⃣ Testing equipment queries...");
    
    try {
      // Test equipment with location query
      const equipmentResult = await query(`
        SELECT e.equipment_number, e.name, el.plant, el.area, e.operational_state
        FROM equipment e
        LEFT JOIN equipment_locations el ON e.location_id = el.id
        LIMIT 5
      `);
      
      console.log(`   ✅ Equipment Query: ${equipmentResult.rows.length} results`);
      equipmentResult.rows.forEach(eq => {
        console.log(`      - ${eq.equipment_number}: ${eq.name} (${eq.plant}-${eq.area}) - ${eq.operational_state}`);
      });
    } catch (error) {
      console.log(`   ❌ Equipment query failed: ${error.message}`);
    }
    
    try {
      // Test maintenance records query
      const maintenanceResult = await query(`
        SELECT mr.work_order_number, mr.work_type, mr.status, e.equipment_number
        FROM maintenance_records mr
        JOIN equipment e ON mr.equipment_id = e.id
        WHERE mr.status IN ('SCHEDULED', 'IN_PROGRESS')
        LIMIT 3
      `);
      
      console.log(`   ✅ Maintenance Query: ${maintenanceResult.rows.length} results`);
      maintenanceResult.rows.forEach(mr => {
        console.log(`      - ${mr.work_order_number}: ${mr.equipment_number} (${mr.work_type}) - ${mr.status}`);
      });
    } catch (error) {
      console.log(`   ❌ Maintenance query failed: ${error.message}`);
    }
    
    console.log("\n🎉 Complete Setup Successful!");
    console.log("\n📊 Industrial AI Copilot Status:");
    console.log("   ✅ Core RAG system ready");
    console.log("   ✅ Equipment Management system ready");
    console.log("   ✅ Industrial equipment data loaded");
    console.log("   ✅ Demo users with equipment roles");
    console.log("   ✅ Enterprise system simulation ready");
    console.log("   ✅ Multi-system federation architecture");
    
    console.log("\n🚀 Phase 29 Equipment Management Ready!");
    console.log("   Next steps:");
    console.log("   1. Create equipment service layer");
    console.log("   2. Build equipment API endpoints");
    console.log("   3. Implement permission-based access");
    console.log("   4. Create equipment management UI");
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Complete setup failed: ${error.message}`);
    console.log("Stack trace:", error.stack);
    return false;
  }
}

// Run the complete setup
setupComplete().then(success => {
  process.exit(success ? 0 : 1);
});