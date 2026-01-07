// Simple Equipment API Test
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_BASE = 'http://localhost:3001/api';

async function testEquipmentAPI() {
  try {
    console.log("🔧 Testing Equipment API...\n");
    
    // First authenticate as admin
    console.log("1️⃣ Authenticating as admin...");
    const authResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const authData = await authResponse.json();
    
    if (!authData.success) {
      console.log("❌ Authentication failed:", authData.error);
      return;
    }
    
    console.log("✅ Authentication successful");
    const token = authData.data.token;
    
    // Test equipment search
    console.log("\n2️⃣ Testing equipment search...");
    const searchResponse = await fetch(`${API_BASE}/equipment`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const searchData = await searchResponse.json();
    console.log(`   Status: ${searchResponse.status}`);
    console.log(`   Response:`, searchData);
    
    // Test equipment detail
    console.log("\n3️⃣ Testing equipment detail...");
    const detailResponse = await fetch(`${API_BASE}/equipment/EQ-PMP-001`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const detailData = await detailResponse.json();
    console.log(`   Status: ${detailResponse.status}`);
    console.log(`   Response:`, detailData);
    
    // Test equipment statistics
    console.log("\n4️⃣ Testing equipment statistics...");
    const statsResponse = await fetch(`${API_BASE}/equipment/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const statsData = await statsResponse.json();
    console.log(`   Status: ${statsResponse.status}`);
    console.log(`   Response:`, statsData);
    
  } catch (error) {
    console.error("Test error:", error.message);
  }
}

testEquipmentAPI();