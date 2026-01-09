/**
 * Test script to check error code detail API endpoints
 */

const API_BASE = 'http://localhost:3001/api';

async function testErrorCodeDetailAPI() {
  console.log('🔍 Testing Error Code Detail API...\n');

  try {
    // Test 1: Get specific error code
    console.log('1. Testing GET /api/error-codes/code/CONV009');
    const codeResponse = await fetch(`${API_BASE}/error-codes/code/CONV009`);
    const codeData = await codeResponse.json();
    
    console.log('Response status:', codeResponse.status);
    console.log('Response data:', JSON.stringify(codeData, null, 2));
    
    if (codeData.success) {
      console.log('✅ Error code found:', codeData.data.code, '-', codeData.data.title);
      
      // Test 2: Get troubleshooting procedures
      console.log('\n2. Testing GET /api/error-codes/code/CONV009/procedures');
      const proceduresResponse = await fetch(`${API_BASE}/error-codes/code/CONV009/procedures`);
      const proceduresData = await proceduresResponse.json();
      
      console.log('Procedures response status:', proceduresResponse.status);
      console.log('Procedures response data:', JSON.stringify(proceduresData, null, 2));
      
      if (proceduresData.success) {
        console.log(`✅ Found ${proceduresData.count} procedures`);
        proceduresData.data.forEach((proc, index) => {
          console.log(`   Step ${proc.step_number}: ${proc.title}`);
        });
      } else {
        console.log('❌ No procedures found or error occurred');
      }
    } else {
      console.log('❌ Error code not found');
    }

    // Test 3: Try another error code
    console.log('\n3. Testing GET /api/error-codes/code/CONV001');
    const conv001Response = await fetch(`${API_BASE}/error-codes/code/CONV001`);
    const conv001Data = await conv001Response.json();
    
    console.log('CONV001 response status:', conv001Response.status);
    if (conv001Data.success) {
      console.log('✅ CONV001 found:', conv001Data.data.title);
      
      // Test procedures for CONV001
      const conv001ProcResponse = await fetch(`${API_BASE}/error-codes/code/CONV001/procedures`);
      const conv001ProcData = await conv001ProcResponse.json();
      console.log(`   Procedures: ${conv001ProcData.count || 0} found`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3001');
    console.log('   Run: cd backend && npm start');
  }
}

// Run the test
testErrorCodeDetailAPI();