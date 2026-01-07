// Setup Main Schema First
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log("🗄️ Setting up Main Database Schema\n");

async function setupMainSchema() {
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
    
    // Read and execute main schema file
    const schemaPath = join(__dirname, 'sql', 'schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`   Processing ${statements.length} schema statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await query(statement);
        if (i % 5 === 0) {
          console.log(`   Progress: ${i + 1}/${statements.length} statements processed`);
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          console.log(`   ⚠️  Warning on statement ${i + 1}: ${error.message}`);
        }
      }
    }
    
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
    
    console.log("\n🎉 Main Schema Setup Complete!");
    console.log("   Next: Run setup-equipment-only.js to add equipment management");
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Main schema setup failed: ${error.message}`);
    console.log("Stack trace:", error.stack);
    return false;
  }
}

// Run the setup
setupMainSchema().then(success => {
  process.exit(success ? 0 : 1);
});