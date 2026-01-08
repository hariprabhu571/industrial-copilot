// Test Equipment Frontend Integration
// Phase 29: Equipment Management Frontend UI Test

async function testEquipmentAPI() {
  console.log('🧪 Testing Equipment Frontend Integration...\n');
  
  const baseURL = 'http://localhost:3001';
  
  // Test admin login
  console.log('1. Testing admin login...');
  const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const loginData = await loginResponse.json();
  if (!loginData.success) {
    console.error('❌ Login failed:', loginData.error);
    return;
  }
  
  const token = loginData.token;
  console.log('✅ Admin login successful');
  
  // Test equipment endpoints
  console.log('\n2. Testing equipment endpoints...');
  
  const endpoints = [
    '/api/equipment',
    '/api/equipment/statistics', 
    '/api/equipment/categories',
    '/api/equipment/locations'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${endpoint}: ${data.message || 'Success'}`);
        if (endpoint === '/api/equipment') {
          console.log(`   - Found ${data.data?.length || 0} equipment items`);
        }
      } else {
        console.log(`❌ ${endpoint}: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Equipment Frontend Integration Test Complete!');
  console.log('\n📱 Frontend URLs:');
  console.log('   - Equipment List: http://localhost:3003/equipment');
  console.log('   - Dashboard: http://localhost:3003/dashboard');
  console.log('   - Login: http://localhost:3003/');
}

testEquipmentAPI().catch(console.error);