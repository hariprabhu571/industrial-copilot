/**
 * Test script to check error code detail API endpoints with authentication
 */

const API_BASE = 'http://localhost:3001/api';

async function testWithAuth() {
  console.log('🔍 Testing Error Code Detail API with Authentication...\n');

  try {
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    console.log('✅ Login successful');
    const token = loginData.token;

    // Step 2: Test specific error code endpoint
    console.log('\n2. Testing GET /api/error-codes/code/CONV009');
    const codeResponse = await fetch(`${API_BASE}/error-codes/code/CONV009`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const codeData = await codeResponse.json();
    console.log('Response status:', codeResponse.status);
    console.log('Response data:', JSON.stringify(codeData, null, 2));

    if (codeData.success) {
      console.log('✅ Error code found:', codeData.data.code, '-', codeData.data.title);

      // Step 3: Test troubleshooting procedures
      console.log('\n3. Testing GET /api/error-codes/code/CONV009/procedures');
      const proceduresResponse = await fetch(`${API_BASE}/error-codes/code/CONV009/procedures`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const proceduresData = await proceduresResponse.json();
      console.log('Procedures response status:', proceduresResponse.status);
      console.log('Procedures response data:', JSON.stringify(proceduresData, null, 2));

      if (proceduresData.success) {
        console.log(`✅ Found ${proceduresData.count} procedures for CONV009`);
        if (proceduresData.data && proceduresData.data.length > 0) {
          proceduresData.data.forEach((proc) => {
            console.log(`   Step ${proc.step_number}: ${proc.title} (${proc.estimated_time_minutes}min)`);
          });
        }
      } else {
        console.log('⚠️  No procedures found for CONV009');
      }

      // Step 4: Test with CONV001 (should have procedures)
      console.log('\n4. Testing GET /api/error-codes/code/CONV001/procedures');
      const conv001ProcResponse = await fetch(`${API_BASE}/error-codes/code/CONV001/procedures`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const conv001ProcData = await conv001ProcResponse.json();
      console.log('CONV001 procedures response status:', conv001ProcResponse.status);
      
      if (conv001ProcData.success) {
        console.log(`✅ Found ${conv001ProcData.count} procedures for CONV001`);
        if (conv001ProcData.data && conv001ProcData.data.length > 0) {
          conv001ProcData.data.forEach((proc) => {
            console.log(`   Step ${proc.step_number}: ${proc.title}`);
          });
        }
      } else {
        console.log('⚠️  No procedures found for CONV001');
      }

    } else {
      console.log('❌ Error code not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3001');
    console.log('   Run: cd backend && npm start');
  }
}

// Run the test
testWithAuth();