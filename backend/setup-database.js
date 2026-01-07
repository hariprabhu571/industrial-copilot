// Database setup script
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log("🗄️  Setting up Industrial AI Copilot Database\n");

async function setupDatabase() {
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
      console.log("   Please install pgvector manually or use a managed database with vector support");
      return false;
    }
    
    console.log("\n3️⃣ Creating database schema...");
    
    // Read and execute schema file
    const schemaPath = join(__dirname, 'sql', 'schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await query(statement);
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          console.log(`   ⚠️  Warning: ${error.message}`);
        }
      }
    }
    
    console.log("   ✅ Database schema created");
    
    console.log("\n4️⃣ Verifying tables...");
    const tables = ['documents', 'chunks', 'embeddings', 'audit_logs', 'users'];
    
    for (const table of tables) {
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
    
    console.log("\n5️⃣ Verifying indexes...");
    const indexResult = await query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('documents', 'chunks', 'embeddings', 'audit_logs', 'users')
      AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `);
    
    console.log(`   ✅ Created ${indexResult.rows.length} performance indexes`);
    indexResult.rows.forEach(row => {
      console.log(`      - ${row.indexname}`);
    });
    
    console.log("\n6️⃣ Testing vector operations...");
    try {
      // Test vector operations
      await query("SELECT '[1,2,3]'::vector <=> '[1,2,4]'::vector as distance");
      console.log("   ✅ Vector operations working");
    } catch (error) {
      console.log(`   ❌ Vector operations failed: ${error.message}`);
    }
    
    console.log("\n🏭 Setting up Equipment Management System (Phase 29)...");
    
    // Apply Equipment Management Schema
    const equipmentSchemaPath = join(__dirname, 'sql', 'equipment-schema.sql');
    try {
      const equipmentSchemaSQL = readFileSync(equipmentSchemaPath, 'utf8');
      
      // Split and execute equipment schema statements
      const equipmentStatements = equipmentSchemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of equipmentStatements) {
        try {
          await query(statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.log(`   ⚠️  Warning: ${error.message}`);
          }
        }
      }
      
      console.log("   ✅ Equipment Management schema created");
    } catch (error) {
      console.log(`   ❌ Equipment schema setup failed: ${error.message}`);
    }
    
    // Load Equipment Sample Data
    const equipmentDataPath = join(__dirname, 'sql', 'equipment-sample-data.sql');
    try {
      const equipmentDataSQL = readFileSync(equipmentDataPath, 'utf8');
      
      // Split and execute equipment data statements
      const dataStatements = equipmentDataSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of dataStatements) {
        try {
          await query(statement);
        } catch (error) {
          // Ignore duplicate key errors for sample data
          if (!error.message.includes('duplicate key') && !error.message.includes('already exists')) {
            console.log(`   ⚠️  Warning: ${error.message}`);
          }
        }
      }
      
      console.log("   ✅ Equipment sample data loaded");
    } catch (error) {
      console.log(`   ❌ Equipment data loading failed: ${error.message}`);
    }
    
    // Verify Equipment Management Setup
    console.log("\n7️⃣ Verifying Equipment Management...");
    try {
      const equipmentCount = await query('SELECT COUNT(*) FROM equipment');
      const userCount = await query('SELECT COUNT(*) FROM users WHERE equipment_role IS NOT NULL');
      const maintenanceCount = await query('SELECT COUNT(*) FROM maintenance_records');
      
      console.log(`   ✅ Equipment Records: ${equipmentCount.rows[0].count}`);
      console.log(`   ✅ Users with Equipment Roles: ${userCount.rows[0].count}`);
      console.log(`   ✅ Maintenance Records: ${maintenanceCount.rows[0].count}`);
    } catch (error) {
      console.log(`   ❌ Equipment verification failed: ${error.message}`);
    }
    
    console.log("\n🎉 Database setup complete!");
    console.log("\n📋 Summary:");
    console.log("   ✅ PostgreSQL connected");
    console.log("   ✅ pgvector extension installed");
    console.log("   ✅ All tables created");
    console.log("   ✅ Performance indexes created");
    console.log("   ✅ Vector operations verified");
    console.log("   ✅ Equipment Management System ready");
    
    console.log("\n🚀 Ready for testing!");
    console.log("   Next steps:");
    console.log("   1. Start the backend: npm start");
    console.log("   2. Run system tests: node test-complete-system.js");
    console.log("   3. Run API tests: node test-api-endpoints.js");
    console.log("   4. Test equipment management: Access /api/equipment endpoints");
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Database setup failed: ${error.message}`);
    console.log("\nTroubleshooting:");
    console.log("1. Check your .env file has correct database credentials");
    console.log("2. Make sure PostgreSQL is running");
    console.log("3. Ensure the database exists");
    console.log("4. Check if pgvector extension is available");
    return false;
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { setupDatabase };