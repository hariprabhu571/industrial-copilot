// Test database connection and structure
import dotenv from 'dotenv';
import { query } from '../../src/db/postgres.js';

// Explicitly load environment variables
dotenv.config();

console.log('🔧 Environment check:');
console.log('   POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('   POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('   POSTGRES_DB:', process.env.POSTGRES_DB);
console.log('   POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '***' : 'NOT SET');
console.log('');

async function testDatabase() {
  console.log('🔍 Testing database connection and structure...\n');
  
  try {
    // Test connection
    const result = await query('SELECT version()');
    console.log('✅ Connected:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);
    
    // Check tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('✅ Tables:', tables.rows.map(r => r.table_name).join(', '));
    
    // Check embeddings table structure
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'embeddings'
      ORDER BY ordinal_position
    `);
    console.log('✅ Embeddings columns:');
    columns.rows.forEach(r => {
      console.log(`   - ${r.column_name}: ${r.data_type}`);
    });
    
    // Check chunks table for pii_masked column
    const chunkColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'chunks'
      ORDER BY ordinal_position
    `);
    console.log('✅ Chunks columns:');
    chunkColumns.rows.forEach(r => {
      console.log(`   - ${r.column_name}: ${r.data_type}`);
    });
    
    // Check if we need to add pii_masked column
    const hasPiiMasked = chunkColumns.rows.some(r => r.column_name === 'pii_masked');
    if (!hasPiiMasked) {
      console.log('\n⚠️  Adding missing pii_masked column...');
      await query('ALTER TABLE chunks ADD COLUMN pii_masked BOOLEAN DEFAULT FALSE');
      await query('CREATE INDEX IF NOT EXISTS idx_chunks_pii_masked ON chunks(pii_masked)');
      console.log('✅ Added pii_masked column to chunks table');
    } else {
      console.log('✅ pii_masked column already exists');
    }
    
    console.log('\n🎉 Database structure is ready!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  process.exit(0);
}

testDatabase();