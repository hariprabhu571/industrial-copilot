/**
 * Error Code Database Setup Script
 * Phase 32: Error Code & Troubleshooting System
 */

import { query } from './src/db/postgres.js';
import fs from 'fs';
import './src/bootstrap.js';

async function setupErrorCodeTables() {
  try {
    console.log('🚀 Setting up error code tables...');
    
    // Read and execute error code schema
    console.log('📋 Creating error code tables...');
    const errorCodeSchema = fs.readFileSync('./sql/error-codes-schema.sql', 'utf8');
    await query(errorCodeSchema);
    console.log('✅ Error code tables created');
    
    // Read and execute sample data
    console.log('📊 Inserting sample error code data...');
    const sampleData = fs.readFileSync('./sql/error-codes-sample-data.sql', 'utf8');
    await query(sampleData);
    console.log('✅ Sample error code data inserted');
    
    // Verify data
    console.log('🔍 Verifying data...');
    const errorCodeCount = await query('SELECT COUNT(*) as count FROM error_codes');
    const procedureCount = await query('SELECT COUNT(*) as count FROM troubleshooting_procedures');
    
    console.log(`✅ Total error codes: ${errorCodeCount.rows[0].count}`);
    console.log(`✅ Total troubleshooting procedures: ${procedureCount.rows[0].count}`);
    
    // Show sample data
    console.log('\n📋 Sample error codes:');
    const sampleCodes = await query('SELECT code, title, severity_level FROM error_codes LIMIT 5');
    sampleCodes.rows.forEach(code => {
      console.log(`  - ${code.code}: ${code.title} (${code.severity_level})`);
    });
    
    console.log('\n🎉 Error code database setup complete!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupErrorCodeTables();