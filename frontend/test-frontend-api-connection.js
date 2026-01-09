/**
 * Simple test to check if frontend can reach backend API
 * Run this from the frontend directory
 */

async function testConnection() {
  console.log('🔍 Testing Frontend to Backend API Connection...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('/api/health');
    console.log('Health response status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData.status);
    } else {
      console.log('❌ Health check failed');
      return;
    }

    // Test 2: Login
    console.log('\n2. Testing login...');
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      
      if (loginData.success && loginData.data.token) {
        const token = loginData.data.token;
        console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');

        // Test 3: Protected endpoint
        console.log('\n3. Testing protected error codes endpoint...');
        const errorCodesResponse = await fetch('/api/error-codes/code/CONV009', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Error codes response status:', errorCodesResponse.status);
        
        if (errorCodesResponse.ok) {
          const errorCodeData = await errorCodesResponse.json();
          console.log('✅ Error code endpoint working:', errorCodeData.data?.code);
        } else {
          const errorText = await errorCodesResponse.text();
          console.log('❌ Error code endpoint failed:', errorText);
        }
      }
    } else {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginError);
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n💡 This suggests the frontend cannot reach the backend.');
    console.log('   Make sure:');
    console.log('   1. Backend server is running on port 3001');
    console.log('   2. Frontend is configured to proxy to backend');
    console.log('   3. No CORS issues');
  }
}

// Run the test
testConnection();