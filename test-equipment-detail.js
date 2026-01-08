// Test Equipment Detail Page
// Debug equipment detail navigation issue

async function testEquipmentDetail() {
  console.log('🧪 Testing Equipment Detail Navigation...\n');
  
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
  
  // Get equipment list first
  console.log('\n2. Getting equipment list...');
  const equipmentResponse = await fetch(`${baseURL}/api/equipment`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const equipmentData = await equipmentResponse.json();
  if (!equipmentData.success) {
    console.error('❌ Equipment list failed:', equipmentData.error);
    return;
  }
  
  console.log(`✅ Found ${equipmentData.data.length} equipment items`);
  
  // Test first equipment detail
  if (equipmentData.data.length > 0) {
    const firstEquipment = equipmentData.data[0];
    console.log(`\n3. Testing equipment detail for: ${firstEquipment.equipmentNumber}`);
    console.log(`   Equipment ID: ${firstEquipment.id}`);
    
    const detailResponse = await fetch(`${baseURL}/api/equipment/${firstEquipment.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const detailData = await detailResponse.json();
    if (detailData.success) {
      console.log('✅ Equipment detail API working');
      console.log(`   Name: ${detailData.data.name}`);
      console.log(`   Status: ${detailData.data.operationalState}`);
      console.log(`   Location: ${detailData.data.location?.plant}/${detailData.data.location?.area}`);
    } else {
      console.error('❌ Equipment detail failed:', detailData.error);
    }
    
    // Test status endpoint
    console.log('\n4. Testing equipment status...');
    const statusResponse = await fetch(`${baseURL}/api/equipment/${firstEquipment.id}/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statusData = await statusResponse.json();
    if (statusData.success) {
      console.log('✅ Equipment status API working');
      console.log(`   OEE: ${((statusData.data.availabilityPercentage * statusData.data.reliabilityPercentage * statusData.data.efficiencyPercentage) / 10000).toFixed(1)}%`);
    } else {
      console.error('❌ Equipment status failed:', statusData.error);
    }
  }
  
  console.log('\n🎉 Equipment Detail Test Complete!');
  console.log('\n📱 Test URLs:');
  console.log(`   - Equipment Detail: http://localhost:3003/equipment/${equipmentData.data[0]?.id}`);
  console.log('   - Equipment List: http://localhost:3003/equipment');
}

testEquipmentDetail().catch(console.error);