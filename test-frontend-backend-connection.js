// Test Frontend-Backend Connection
// Debug the equipment API issue

async function testConnection() {
  console.log('🧪 Testing Frontend-Backend Connection...\n');
  
  const backendURL = 'http://localhost:3001';
  const frontendURL = 'http://localhost:3003';
  
  try {
    // 1. Test backend health
    console.log('1. Testing backend health...');
    const healthResponse = await fetch(`${backendURL}/api/health`);
    const healthData = await healthResponse.text();
    console.log('✅ Backend health:', healthData);
    
    // 2. Test authentication
    console.log('\n2. Testing authentication...');
    const loginResponse = await fetch(`${backendURL}/api/auth/login`, {
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
    
    const token = loginData.data.token;
    console.log('✅ Authentication successful');
    console.log('   Token preview:', token.substring(0, 50) + '...');
    
    // 3. Test equipment list
    console.log('\n3. Testing equipment list...');
    const equipmentResponse = await fetch(`${backendURL}/api/equipment`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const equipmentData = await equipmentResponse.json();
    if (equipmentData.success) {
      console.log('✅ Equipment list successful');
      console.log(`   Found ${equipmentData.data.length} equipment items`);
      
      // 4. Test specific equipment detail
      if (equipmentData.data.length > 0) {
        const firstEquipment = equipmentData.data[0];
        console.log(`\n4. Testing equipment detail for: ${firstEquipment.equipmentNumber}`);
        
        const detailResponse = await fetch(`${backendURL}/api/equipment/${firstEquipment.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const detailData = await detailResponse.json();
        if (detailData.success) {
          console.log('✅ Equipment detail successful');
          console.log(`   Equipment: ${detailData.data.name}`);
          console.log(`   Status: ${detailData.data.operationalState}`);
        } else {
          console.error('❌ Equipment detail failed:', detailData.error);
        }
      }
    } else {
      console.error('❌ Equipment list failed:', equipmentData.error);
    }
    
    // 5. Test frontend proxy (if possible)
    console.log('\n5. Testing frontend proxy...');
    try {
      const proxyResponse = await fetch(`${frontendURL}/api/equipment`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (proxyResponse.ok) {
        const proxyData = await proxyResponse.json();
        console.log('✅ Frontend proxy working');
        console.log(`   Proxy returned ${proxyData.data?.length || 0} items`);
      } else {
        console.log(`⚠️ Frontend proxy issue: ${proxyResponse.status} ${proxyResponse.statusText}`);
      }
    } catch (proxyError) {
      console.log(`⚠️ Frontend proxy not accessible: ${proxyError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
  
  console.log('\n🎉 Connection test complete!');
  console.log('\n📱 URLs to test:');
  console.log('   - Backend: http://localhost:3001/api/equipment');
  console.log('   - Frontend: http://localhost:3003/equipment');
  console.log('   - Debug: http://localhost:3003/equipment/debug');
}

testConnection().catch(console.error);