/**
 * Test script to verify frontend error codes page functionality
 */

import fetch from 'node-fetch';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

async function testFrontendErrorCodes() {
  console.log('🧪 Testing Frontend Error Codes Page...\n');

  try {
    // Test 1: Check if frontend is running
    console.log('1. Testing frontend availability...');
    const frontendResponse = await fetch(FRONTEND_URL);
    if (frontendResponse.ok) {
      console.log('✅ Frontend is running on port 3000');
    } else {
      console.log('❌ Frontend not responding');
      return;
    }

    // Test 2: Check if backend API is accessible through frontend proxy
    console.log('\n2. Testing API proxy...');
    const healthResponse = await fetch(`${FRONTEND_URL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ API proxy working:', healthData.status);
    } else {
      console.log('❌ API proxy not working');
    }

    // Test 3: Test authentication through frontend
    console.log('\n3. Testing authentication through frontend...');
    const loginResponse = await fetch(`${FRONTEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Authentication working through frontend');
      
      // Test 4: Test error codes API through frontend
      console.log('\n4. Testing error codes API through frontend...');
      const token = loginData.data.token;
      const errorCodesResponse = await fetch(`${FRONTEND_URL}/api/error-codes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (errorCodesResponse.ok) {
        const errorCodesData = await errorCodesResponse.json();
        console.log(`✅ Error codes API working: ${errorCodesData.count} error codes found`);
        console.log(`   Sample codes: ${errorCodesData.data.slice(0, 3).map(c => c.code).join(', ')}`);
      } else {
        console.log('❌ Error codes API not working through frontend');
      }

      // Test 5: Test statistics API through frontend
      console.log('\n5. Testing statistics API through frontend...');
      const statsResponse = await fetch(`${FRONTEND_URL}/api/error-codes/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Statistics API working through frontend');
        console.log(`   Total: ${statsData.data.totalErrorCodes}, Critical: ${statsData.data.criticalErrors}`);
      } else {
        console.log('❌ Statistics API not working through frontend');
      }
    } else {
      console.log('❌ Authentication not working through frontend');
    }

    console.log('\n🎉 Frontend API tests completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Login with admin/admin123');
    console.log('   3. Navigate to Error Codes page');
    console.log('   4. Check browser console for any JavaScript errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendErrorCodes();