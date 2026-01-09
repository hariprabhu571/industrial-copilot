import { default as ErrorCodeService } from './src/services/ErrorCodeService.js';
import { query } from './src/db/postgres.js';
import './src/bootstrap.js';

async function testErrorCodeService() {
  try {
    console.log('🧪 Testing ErrorCodeService...');
    
    const service = new ErrorCodeService({ query });
    
    // Test getting all error codes
    const errorCodes = await service.getAllErrorCodes();
    console.log(`✅ Found ${errorCodes.length} error codes`);
    
    // Test getting specific error code
    const conv001 = await service.getErrorCodeByCode('CONV001');
    console.log(`✅ Found error code: ${conv001.code} - ${conv001.title}`);
    
    // Test getting procedures
    const procedures = await service.getTroubleshootingProceduresByCode('CONV001');
    console.log(`✅ Found ${procedures.length} procedures for CONV001`);
    
    console.log('🎉 ErrorCodeService working correctly!');
  } catch (error) {
    console.error('❌ Error testing service:', error);
  }
}

testErrorCodeService();